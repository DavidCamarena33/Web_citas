import {
  getFavoritosByUsuario,
  existeFavorito,
  crearFavorito,
  eliminarFavorito,
} from "../models/favoritosModel.js";

export async function listarFavoritos(req, res, next) {
  try {
    const favoritos = await getFavoritosByUsuario(req.id);
    return res.status(200).json(favoritos);
  } catch (err) {
    next(err);
  }
}

export async function toggleFavorito(req, res, next) {
  try {
    const id_plan = Number(req.params.id);

    if (!Number.isInteger(id_plan) || id_plan <= 0) {
      return res.status(400).json({ message: "Plan invalido" });
    }

    const favorito = await existeFavorito(req.id, id_plan);

    if (favorito) {
      await eliminarFavorito(req.id, id_plan);
      return res.status(200).json({ favorite: false, message: "Favorito eliminado" });
    }

    await crearFavorito(req.id, id_plan);
    return res.status(201).json({ favorite: true, message: "Favorito guardado" });
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(200).json({ favorite: true, message: "Favorito ya guardado" });
    }
    next(err);
  }
}
