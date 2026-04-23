import { crearSolicitud, getSolicitudesPlan, getMisSolicitudes, actualizarEstado, getCupoPlan, getSolicitudById } from "../models/solicitudesModel.js";

export async function solicitar(req, res, next) {
  try {
    const id_solicitante = req.id;
    const { id_plan, mensaje } = req.body;
    if (!id_plan) return res.status(400).json({ message: 'Falta id_plan' });

    const cupo = await getCupoPlan(id_plan);
    if (!cupo) return res.status(404).json({ message: 'Plan no encontrado' });
    if (Number(cupo.id_usuario) === Number(id_solicitante)) {
      return res.status(403).json({ message: 'No puedes unirte a un plan creado por ti' });
    }
    if (Number(cupo.aceptadas) >= Number(cupo.max_asistentes)) {
      return res.status(409).json({ message: 'Este plan ya está completo' });
    }

    const result = await crearSolicitud(id_plan, id_solicitante, mensaje);
    return res.status(201).json({ message: 'Solicitud enviada', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya enviaste una solicitud para este plan' });
    }
    next(err);
  }
}

export async function solicitudesDePlan(req, res, next) {
  try {
    const cupo = await getCupoPlan(req.params.id_plan);
    if (!cupo) return res.status(404).json({ message: 'Plan no encontrado' });
    if (Number(cupo.id_usuario) !== Number(req.id)) {
      return res.status(403).json({ message: 'No autorizado para ver estas solicitudes' });
    }

    const rows = await getSolicitudesPlan(req.params.id_plan);
    return res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

export async function misSolicitudes(req, res, next) {
  try {
    const rows = await getMisSolicitudes(req.id);
    return res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

export async function responderSolicitud(req, res, next) {
  try {
    const { estado } = req.body;
    if (!['aceptada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const solicitud = await getSolicitudById(req.params.id);
    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    const cupo = await getCupoPlan(solicitud.id_plan);
    if (!cupo) {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }
    if (Number(cupo.id_usuario) !== Number(req.id)) {
      return res.status(403).json({ message: 'No autorizado para responder esta solicitud' });
    }

    if (estado === 'aceptada') {
      if (cupo && Number(cupo.aceptadas) >= Number(cupo.max_asistentes)) {
        return res.status(409).json({ message: 'No puedes aceptar más personas: cupo completo' });
      }
    }
    await actualizarEstado(req.params.id, estado);
    return res.status(200).json({ message: `Solicitud ${estado}` });
  } catch (err) {
    next(err);
  }
}
