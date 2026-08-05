"""Ship Meshy-authored hero/env GLBs into public/models with Draco + texture downscale.

Usage (background):
  blender --background --python tools/blender/ship_meshy_hero.py -- \\
    --in tools/meshy_raw/riser-player-meshy.glb \\
    --out riser-player.glb --height 1.55 --tex 1024

Or import one asset via Blender MCP / execute_blender_code by calling ship().
"""
from __future__ import annotations

import argparse
import os
import sys

import bpy

REPO = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_DIR = os.path.join(REPO, "public", "models")


def _clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.images, bpy.data.armatures):
        for b in list(block):
            block.remove(b)


def _import_glb(path: str) -> list[bpy.types.Object]:
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    return [o for o in bpy.data.objects if o not in before]


def _bbox_world(objs: list[bpy.types.Object]) -> tuple[float, float, float, float, float, float]:
    mins = [1e9, 1e9, 1e9]
    maxs = [-1e9, -1e9, -1e9]
    for o in objs:
        if o.type != "MESH":
            continue
        for corner in o.bound_box:
            w = o.matrix_world @ __import__("mathutils").Vector(corner)
            for i in range(3):
                mins[i] = min(mins[i], w[i])
                maxs[i] = max(maxs[i], w[i])
    return (*mins, *maxs)


def _scale_to_height(objs: list[bpy.types.Object], target_h: float) -> None:
    mn_x, mn_y, mn_z, mx_x, mx_y, mx_z = _bbox_world(objs)
    h = max(1e-6, mx_z - mn_z)
    s = target_h / h
    roots = [o for o in objs if o.parent is None]
    for r in roots:
        r.scale = (r.scale[0] * s, r.scale[1] * s, r.scale[2] * s)
        bpy.context.view_layer.update()
    # Re-origin: bottom center at world origin
    mn_x, mn_y, mn_z, mx_x, mx_y, mx_z = _bbox_world(objs)
    cx = (mn_x + mx_x) * 0.5
    cy = (mn_y + mx_y) * 0.5
    for r in roots:
        r.location.x -= cx
        r.location.y -= cy
        r.location.z -= mn_z
    bpy.context.view_layer.update()
    for r in roots:
        bpy.ops.object.select_all(action="DESELECT")
        r.select_set(True)
        bpy.context.view_layer.objects.active = r
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)


def _downscale_images(max_dim: int) -> int:
    n = 0
    for img in bpy.data.images:
        if img.size[0] <= 0 or img.size[1] <= 0:
            continue
        w, h = img.size[0], img.size[1]
        if max(w, h) <= max_dim:
            continue
        scale = max_dim / float(max(w, h))
        nw = max(1, int(w * scale))
        nh = max(1, int(h * scale))
        img.scale(nw, nh)
        n += 1
    return n


def _boost_emissive() -> None:
    for mat in bpy.data.materials:
        if not mat.use_nodes:
            continue
        for node in mat.node_tree.nodes:
            if node.type != "BSDF_PRINCIPLED":
                continue
            if "Emission Strength" in node.inputs:
                cur = node.inputs["Emission Strength"].default_value
                if cur < 0.05:
                    # nudge dark Meshy mats that have emission maps wired
                    for link in mat.node_tree.links:
                        if link.to_socket == node.inputs.get("Emission Color") or (
                            "Emission" in node.inputs and link.to_socket == node.inputs["Emission"]
                        ):
                            node.inputs["Emission Strength"].default_value = max(cur, 1.2)
                            break


def ship(
    in_path: str,
    out_name: str,
    height: float = 1.55,
    tex_max: int = 1024,
    join: bool = True,
) -> str:
    in_path = os.path.normpath(in_path)
    if not os.path.isabs(in_path):
        in_path = os.path.join(REPO, in_path)
    if not os.path.exists(in_path):
        raise FileNotFoundError(in_path)

    _clear_scene()
    objs = _import_glb(in_path)
    meshes = [o for o in objs if o.type == "MESH"]
    if not meshes:
        raise RuntimeError(f"No mesh in {in_path}")

    _scale_to_height(objs, height)

    if join and len(meshes) > 1:
        bpy.ops.object.select_all(action="DESELECT")
        for m in meshes:
            m.select_set(True)
        bpy.context.view_layer.objects.active = meshes[0]
        bpy.ops.object.join()
        meshes = [bpy.context.view_layer.objects.active]

    resized = _downscale_images(tex_max)
    _boost_emissive()

    os.makedirs(OUT_DIR, exist_ok=True)
    out_path = os.path.join(OUT_DIR, out_name)
    bpy.ops.object.select_all(action="DESELECT")
    for o in bpy.data.objects:
        o.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        use_selection=True,
        export_format="GLB",
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_yup=True,
        export_image_format="AUTO",
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
    )
    size = os.path.getsize(out_path)
    verts = sum(len(o.data.vertices) for o in bpy.data.objects if o.type == "MESH")
    print(f"SHIPPED {out_name}: verts={verts} tex_resized={resized} size={size}")
    return out_path


def main() -> None:
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1 :]
    else:
        argv = []
    p = argparse.ArgumentParser()
    p.add_argument("--in", dest="inp", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--height", type=float, default=1.55)
    p.add_argument("--tex", type=int, default=1024)
    p.add_argument("--no-join", action="store_true")
    args = p.parse_args(argv)
    path = ship(args.inp, args.out, height=args.height, tex_max=args.tex, join=not args.no_join)
    print("DONE", path, os.path.getsize(path))


if __name__ == "__main__":
    main()
