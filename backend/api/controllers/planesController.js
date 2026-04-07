import { crearPlan, guardarFotosPlan, getPlanes, getPlanById, getPlanesByUsuario, getIntereses } from "../models/planesModel.js";

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export async function listarPlanes(req, res, next) {
  try {
    const planes = await getPlanes();
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
    const { id_interes, titulo, descripcion, lat, lng, fecha_plan } = req.body;
    if (!id_interes || !titulo || !descripcion || !lat || !lng) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    const result = await crearPlan(id_usuario, id_interes, titulo, descripcion, lat, lng, fecha_plan);
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
