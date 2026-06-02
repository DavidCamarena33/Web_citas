import { crearPlan, getPlanRatingByUser, getPlanRatingEligibility, getPlanRatingSummary, guardarFotosPlan, getPlanes, getPlanById, getPlanesByUsuario, getIntereses, upsertPlanRating } from "../models/planesModel.js";

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const ratingReasonMessages = {
  PLAN_NOT_FOUND: "Plan no encontrado",
  OWN_PLAN: "No puedes valorar tu propio plan",
  NOT_ACCEPTED: "Solo puedes valorar planes en los que fuiste aceptado",
  NO_DATE: "No puedes valorar un plan sin fecha",
  INVALID_DATE: "La fecha del plan no es válida",
  PLAN_NOT_ENDED: "Solo puedes valorar un plan cuando ya ha finalizado",
};

function normalizePlanId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function listarPlanes(req, res, next) {
  try {
    const orientacion = req.query.orientacion;
    const modalidad = req.query.modalidad;
    const radio = req.query.radio;
    const userLat = req.query.lat;
    const userLng = req.query.lng;
    const fechaDesde = req.query.fecha_desde || null;
    const fechaHasta = req.query.fecha_hasta || null;

    const hostOrientation =
      orientacion && orientacion !== 'all' ? orientacion : null;
    const capacityMode =
      modalidad === 'pareja' || modalidad === 'grupo' ? modalidad : null;
    const radioKm = radio ? Number(radio) : null;

    const planes = await getPlanes({
      excludeUserId: req.id,
      hostOrientation,
      capacityMode,
      lat: radioKm ? userLat : null,
      lng: radioKm ? userLng : null,
      radio: radioKm,
      fechaDesde,
      fechaHasta,
    });
    const planesConFoto = planes.map(p => ({
      ...p,
      foto: p.foto ? `${BASE_URL}/uploads/${p.foto.split('/').pop()}` : null,
    }));
    return res.status(200).json(planesConFoto);
  } catch (err) {
    next(err);
  }
}

export async function detallePlan(req, res, next) {
  try {
    const plan = await getPlanById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan no encontrado' });
    plan.fotos = plan.fotos.map(f => `${BASE_URL}/uploads/${f.split('/').pop()}`);
    return res.status(200).json(plan);
  } catch (err) {
    next(err);
  }
}

export async function nuevoPlan(req, res, next) {
  try {
    const id_usuario = req.id;
    const { id_interes, titulo, descripcion, max_asistentes, lat, lng, fecha_plan } = req.body;
    if (!id_interes || !titulo || !descripcion || !lat || !lng || !max_asistentes) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    const maxAsistentes = Number(max_asistentes);
    if (!Number.isInteger(maxAsistentes) || maxAsistentes < 2 || maxAsistentes > 100) {
      return res.status(400).json({ message: 'La capacidad debe estar entre 2 y 100 personas' });
    }

    const result = await crearPlan(
      id_usuario,
      id_interes,
      titulo,
      descripcion,
      maxAsistentes,
      lat,
      lng,
      fecha_plan
    );
    const id_plan = result.insertId;

    if (req.files && req.files.length > 0) {
      const urls = req.files.map(f => f.filename);
      await guardarFotosPlan(id_plan, urls);
    }

    return res.status(201).json({ message: 'Plan creado', id: id_plan });
  } catch (err) {
    next(err);
  }
}

export async function misPlanesHandler(req, res, next) {
  try {
    const id_usuario = req.id;
    const planes = await getPlanesByUsuario(id_usuario);
    return res.status(200).json(planes);
  } catch (err) {
    next(err);
  }
}

export async function listarIntereses(req, res, next) {
  try {
    const intereses = await getIntereses();
    return res.status(200).json(intereses);
  } catch (err) {
    next(err);
  }
}

export async function getPlanRatingStatus(req, res, next) {
  try {
    const id_plan = normalizePlanId(req.params.id);
    if (!id_plan) {
      return res.status(400).json({ message: "Id de plan no válido" });
    }

    const existingRating = await getPlanRatingByUser(id_plan, req.id);
    const summary = await getPlanRatingSummary(id_plan);
    const eligibility = await getPlanRatingEligibility(id_plan, req.id);

    return res.status(200).json({
      canRate: eligibility.canRate,
      reason: eligibility.reason,
      reasonMessage: eligibility.reason ? ratingReasonMessages[eligibility.reason] : null,
      userRating: existingRating,
      averageRating: summary.average_rating,
      ratingsCount: Number(summary.ratings_count || 0),
    });
  } catch (err) {
    next(err);
  }
}

export async function valorarPlan(req, res, next) {
  try {
    const id_plan = normalizePlanId(req.params.id);
    const puntuacion = Number(req.body?.puntuacion);
    const comentario = String(req.body?.comentario || "").trim();

    if (!id_plan) {
      return res.status(400).json({ message: "Id de plan no válido" });
    }

    if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({ message: "La puntuación debe estar entre 1 y 5" });
    }

    const eligibility = await getPlanRatingEligibility(id_plan, req.id);
    if (eligibility.reason === "PLAN_NOT_FOUND") {
      return res.status(404).json({ message: ratingReasonMessages.PLAN_NOT_FOUND });
    }

    if (!eligibility.canRate) {
      return res.status(403).json({
        message: ratingReasonMessages[eligibility.reason] || "No puedes valorar este plan",
        reason: eligibility.reason,
      });
    }

    await upsertPlanRating(id_plan, req.id, puntuacion, comentario);
    const summary = await getPlanRatingSummary(id_plan);

    return res.status(200).json({
      message: "Valoración guardada",
      averageRating: summary.average_rating,
      ratingsCount: Number(summary.ratings_count || 0),
    });
  } catch (err) {
    next(err);
  }
}
