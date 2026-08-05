"""Rebuild Fortnite-grade sculpted PBR hero GLBs for aaamath (iPhone budget).
Run inside Blender via MCP execute_blender_code or:
  blender --background --python tools/blender/rebuild_heroes_pbr.py
"""
from __future__ import annotations

import math
import os

import bpy

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "public", "models")
OUT_DIR = os.path.normpath(OUT_DIR)


def clear_heroes() -> None:
    victims = [
        o
        for o in list(bpy.data.objects)
        if o.name.startswith(("Player_", "Term_", "BP_", "Zone_", "AR_"))
    ]
    for o in victims:
        bpy.data.objects.remove(o, do_unlink=True)


def mat(
    name: str,
    base: tuple[float, float, float],
    metallic: float = 0.2,
    roughness: float = 0.45,
    emit: tuple[float, float, float] = (0.0, 0.0, 0.0),
    emit_str: float = 0.0,
) -> bpy.types.Material:
    m = bpy.data.materials.get(name)
    if m is None:
        m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = (*base, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if "Emission Color" in bsdf.inputs:
        bsdf.inputs["Emission Color"].default_value = (*emit, 1.0)
        bsdf.inputs["Emission Strength"].default_value = emit_str
    elif "Emission" in bsdf.inputs:
        bsdf.inputs["Emission"].default_value = (*emit, 1.0)
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emit_str
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return m


def box_verts(sx: float, sy: float, sz: float):
    x, y, z = sx / 2, sy / 2, sz / 2
    return [
        (-x, -y, -z),
        (x, -y, -z),
        (x, y, -z),
        (-x, y, -z),
        (-x, -y, z),
        (x, -y, z),
        (x, y, z),
        (-x, y, z),
    ]


BOX_FACES = [
    (0, 1, 2, 3),
    (4, 5, 6, 7),
    (0, 1, 5, 4),
    (1, 2, 6, 5),
    (2, 3, 7, 6),
    (3, 0, 4, 7),
]


def apply_bevel_subdiv(obj: bpy.types.Object, bevel_w: float = 0.012, levels: int = 1) -> None:
    bev = obj.modifiers.new("Bevel", "BEVEL")
    bev.width = bevel_w
    bev.segments = 2
    bev.limit_method = "ANGLE"
    bev.angle_limit = math.radians(30)
    if levels > 0:
        sub = obj.modifiers.new("Subsurf", "SUBSURF")
        sub.levels = levels
        sub.render_levels = levels
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    for mod in list(obj.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        except Exception:
            pass
    obj.select_set(False)


def mk_box(
    name: str,
    sx: float,
    sy: float,
    sz: float,
    loc: tuple[float, float, float],
    material: bpy.types.Material,
    parent: bpy.types.Object,
    bevel: float = 0.01,
    subdiv: int = 1,
) -> bpy.types.Object:
    mesh = bpy.data.meshes.new(name + "_M")
    mesh.from_pydata(box_verts(sx, sy, sz), [], BOX_FACES)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    obj.location = loc
    obj.parent = parent
    bpy.context.scene.collection.objects.link(obj)
    obj.data.materials.append(material)
    apply_bevel_subdiv(obj, bevel_w=bevel, levels=subdiv)
    return obj


def mk_cyl(
    name: str,
    r: float,
    depth: float,
    loc: tuple[float, float, float],
    material: bpy.types.Material,
    parent: bpy.types.Object,
    segs: int = 24,
    bevel: float = 0.008,
    subdiv: int = 0,
    rot: tuple[float, float, float] = (0.0, 0.0, 0.0),
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(vertices=segs, radius=r, depth=depth, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.parent = parent
    obj.rotation_euler = rot
    obj.data.materials.clear()
    obj.data.materials.append(material)
    if bevel > 0 or subdiv > 0:
        apply_bevel_subdiv(obj, bevel_w=max(bevel, 0.001), levels=subdiv)
    return obj


def mk_uv_sphere(
    name: str,
    r: float,
    loc: tuple[float, float, float],
    material: bpy.types.Material,
    parent: bpy.types.Object,
    segs: int = 16,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segs, ring_count=segs // 2, radius=r, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.parent = parent
    obj.data.materials.clear()
    obj.data.materials.append(material)
    return obj


def build_materials():
    return {
        "body": mat("AR_Body", (0.08, 0.18, 0.32), metallic=0.35, roughness=0.42),
        "body_lt": mat("AR_BodyLt", (0.12, 0.28, 0.42), metallic=0.4, roughness=0.38),
        "helm": mat("AR_Helm", (0.05, 0.12, 0.2), metallic=0.55, roughness=0.32),
        "dark": mat("AR_Dark", (0.03, 0.06, 0.1), metallic=0.45, roughness=0.5),
        "metal": mat("AR_Metal", (0.55, 0.58, 0.62), metallic=0.85, roughness=0.28),
        "cyan": mat(
            "AR_Cyan",
            (0.1, 0.7, 0.65),
            metallic=0.2,
            roughness=0.25,
            emit=(0.15, 0.85, 0.78),
            emit_str=4.5,
        ),
        "amber": mat(
            "AR_Amber",
            (0.95, 0.65, 0.15),
            metallic=0.35,
            roughness=0.3,
            emit=(0.95, 0.55, 0.1),
            emit_str=3.2,
        ),
        "gold": mat(
            "AR_Gold",
            (0.85, 0.68, 0.25),
            metallic=0.9,
            roughness=0.22,
            emit=(0.6, 0.4, 0.08),
            emit_str=0.8,
        ),
        "navy": mat("AR_NavySuit", (0.04, 0.1, 0.22), metallic=0.15, roughness=0.55),
        "white": mat("AR_WhiteMetal", (0.82, 0.86, 0.9), metallic=0.7, roughness=0.25),
        "crystal": mat(
            "AR_Crystal",
            (0.25, 0.55, 0.95),
            metallic=0.1,
            roughness=0.15,
            emit=(0.2, 0.45, 0.95),
            emit_str=2.8,
        ),
    }


def build_player(M) -> bpy.types.Object:
    root = bpy.data.objects.new("AR_Player", None)
    bpy.context.scene.collection.objects.link(root)

    mk_box("Player_Torso", 0.42, 0.28, 0.52, (0, -0.02, 0.95), M["body"], root, 0.018, 1)
    mk_box("Player_Abdomen", 0.36, 0.24, 0.18, (0, -0.01, 0.68), M["navy"], root, 0.012, 1)
    mk_box("Player_ChestPlate", 0.34, 0.06, 0.28, (0, 0.12, 0.98), M["body_lt"], root, 0.01, 1)
    mk_box("Player_ChestGold", 0.28, 0.03, 0.04, (0, 0.145, 0.88), M["gold"], root, 0.006, 0)
    mk_box("Player_ChestPip", 0.06, 0.04, 0.06, (0, 0.155, 1.02), M["cyan"], root, 0.008, 0)
    mk_box("Player_Conduit_L", 0.03, 0.04, 0.36, (-0.16, 0.13, 0.96), M["gold"], root, 0.004, 0)
    mk_box("Player_Conduit_R", 0.03, 0.04, 0.36, (0.16, 0.13, 0.96), M["gold"], root, 0.004, 0)

    mk_box("Player_Helm", 0.28, 0.3, 0.26, (0, 0.02, 1.38), M["helm"], root, 0.016, 1)
    mk_box("Player_Visor", 0.22, 0.06, 0.08, (0, 0.16, 1.36), M["amber"], root, 0.01, 0)
    mk_box("Player_VisorGlow", 0.18, 0.02, 0.05, (0, 0.19, 1.36), M["cyan"], root, 0.004, 0)

    mk_box("Player_Pauldron_L", 0.2, 0.18, 0.14, (-0.3, 0.0, 1.16), M["body_lt"], root, 0.014, 1)
    mk_box("Player_Pauldron_R", 0.2, 0.18, 0.14, (0.3, 0.0, 1.16), M["body_lt"], root, 0.014, 1)
    mk_box("Player_PaulPip_L", 0.05, 0.03, 0.04, (-0.3, 0.1, 1.2), M["cyan"], root, 0.005, 0)
    mk_box("Player_PaulPip_R", 0.05, 0.03, 0.04, (0.3, 0.1, 1.2), M["cyan"], root, 0.005, 0)

    mk_box("Player_Pack", 0.32, 0.16, 0.38, (0, -0.22, 0.95), M["dark"], root, 0.014, 1)
    mk_cyl(
        "Player_PackCore",
        0.07,
        0.12,
        (0, -0.3, 0.95),
        M["cyan"],
        root,
        16,
        0.006,
        0,
        (math.radians(90), 0, 0),
    )
    mk_box("Player_PackRail", 0.36, 0.04, 0.06, (0, -0.22, 1.14), M["metal"], root, 0.005, 0)

    mk_box("Player_Arm_L", 0.12, 0.14, 0.42, (-0.4, -0.02, 0.82), M["body_lt"], root, 0.012, 1)
    mk_box("Player_Arm_R", 0.12, 0.14, 0.42, (0.4, -0.02, 0.82), M["body_lt"], root, 0.012, 1)
    mk_box("Player_Fore_L", 0.1, 0.12, 0.28, (-0.42, 0.02, 0.52), M["navy"], root, 0.01, 1)
    mk_box("Player_Fore_R", 0.1, 0.12, 0.28, (0.42, 0.02, 0.52), M["navy"], root, 0.01, 1)
    mk_box("Player_Gaunt_L", 0.11, 0.13, 0.1, (-0.42, 0.04, 0.36), M["metal"], root, 0.008, 0)
    mk_box("Player_Gaunt_R", 0.11, 0.13, 0.1, (0.42, 0.04, 0.36), M["metal"], root, 0.008, 0)

    mk_box("Player_Thigh_L", 0.14, 0.16, 0.36, (-0.12, -0.02, 0.42), M["dark"], root, 0.012, 1)
    mk_box("Player_Thigh_R", 0.14, 0.16, 0.36, (0.12, -0.02, 0.42), M["dark"], root, 0.012, 1)
    mk_box("Player_Shin_L", 0.12, 0.14, 0.28, (-0.12, 0.0, 0.16), M["navy"], root, 0.01, 1)
    mk_box("Player_Shin_R", 0.12, 0.14, 0.28, (0.12, 0.0, 0.16), M["navy"], root, 0.01, 1)
    mk_box("Player_Boot_L", 0.14, 0.22, 0.1, (-0.12, 0.04, 0.05), M["dark"], root, 0.01, 0)
    mk_box("Player_Boot_R", 0.14, 0.22, 0.1, (0.12, 0.04, 0.05), M["dark"], root, 0.01, 0)
    mk_box("Player_Knee_L", 0.13, 0.08, 0.1, (-0.12, 0.06, 0.28), M["metal"], root, 0.008, 0)
    mk_box("Player_Knee_R", 0.13, 0.08, 0.1, (0.12, 0.06, 0.28), M["metal"], root, 0.008, 0)

    mk_box("Player_Belt", 0.4, 0.26, 0.08, (0, 0.0, 0.58), M["metal"], root, 0.008, 0)
    mk_box("Player_BeltGem", 0.07, 0.05, 0.06, (0, 0.12, 0.58), M["cyan"], root, 0.006, 0)
    return root


def build_terminal(M) -> bpy.types.Object:
    root = bpy.data.objects.new("AR_Terminal", None)
    bpy.context.scene.collection.objects.link(root)

    mk_box("Term_Plinth", 1.4, 1.4, 0.12, (0, 0, 0.06), M["dark"], root, 0.02, 1)
    mk_box("Term_PlinthTrim", 1.5, 1.5, 0.04, (0, 0, 0.02), M["gold"], root, 0.01, 0)
    mk_cyl("Term_Base", 0.55, 0.18, (0, 0, 0.2), M["metal"], root, 28, 0.012, 1)
    mk_box("Term_Column", 0.55, 0.4, 1.1, (0, -0.05, 0.85), M["body"], root, 0.018, 1)
    mk_box("Term_ColumnAccent", 0.58, 0.08, 0.9, (0, 0.12, 0.9), M["gold"], root, 0.008, 0)
    mk_box("Term_Bezel", 0.72, 0.12, 0.55, (0, 0.18, 1.15), M["white"], root, 0.012, 1)
    mk_box("Term_Screen", 0.58, 0.04, 0.42, (0, 0.25, 1.15), M["cyan"], root, 0.006, 0)
    mk_box("Term_ScreenGlow", 0.5, 0.02, 0.34, (0, 0.28, 1.15), M["crystal"], root, 0.004, 0)
    mk_cyl("Term_Antenna", 0.04, 0.55, (0.22, -0.1, 1.65), M["metal"], root, 12, 0.005, 0)
    mk_uv_sphere("Term_AntennaTip", 0.06, (0.22, -0.1, 1.95), M["amber"], root, 12)
    # Dish — scooped landmark
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.45, location=(0, -0.35, 1.55))
    dish = bpy.context.active_object
    dish.name = "Term_Dish"
    dish.parent = root
    dish.scale = (1.0, 0.35, 1.0)
    dish.data.materials.clear()
    dish.data.materials.append(M["white"])
    apply_bevel_subdiv(dish, bevel_w=0.008, levels=0)
    mk_box("Term_CrystalCore", 0.18, 0.18, 0.35, (0, -0.05, 0.55), M["crystal"], root, 0.01, 0)
    return root


def build_blueprint(M) -> bpy.types.Object:
    root = bpy.data.objects.new("AR_Blueprint", None)
    bpy.context.scene.collection.objects.link(root)

    # Hex-ish pad via cylinder
    mk_cyl("BP_Pad", 0.85, 0.08, (0, 0, 0.04), M["dark"], root, 6, 0.015, 1)
    mk_cyl("BP_Rim", 0.92, 0.04, (0, 0, 0.08), M["cyan"], root, 6, 0.01, 0)
    mk_cyl("BP_Inner", 0.55, 0.03, (0, 0, 0.1), M["gold"], root, 6, 0.008, 0)
    mk_box("BP_Holo", 0.5, 0.5, 0.02, (0, 0, 0.35), M["crystal"], root, 0.004, 0)
    mk_box("BP_HoloStem", 0.04, 0.04, 0.28, (0, 0, 0.22), M["metal"], root, 0.004, 0)
    mk_box("BP_Corner_0", 0.12, 0.12, 0.06, (0.55, 0.55, 0.06), M["amber"], root, 0.006, 0)
    mk_box("BP_Corner_1", 0.12, 0.12, 0.06, (-0.55, 0.55, 0.06), M["amber"], root, 0.006, 0)
    mk_box("BP_Corner_2", 0.12, 0.12, 0.06, (0.55, -0.55, 0.06), M["amber"], root, 0.006, 0)
    mk_box("BP_Corner_3", 0.12, 0.12, 0.06, (-0.55, -0.55, 0.06), M["amber"], root, 0.006, 0)
    return root


def build_zone(M) -> bpy.types.Object:
    root = bpy.data.objects.new("AR_ZoneMarker", None)
    bpy.context.scene.collection.objects.link(root)

    mk_cyl("Zone_Base", 0.45, 0.1, (0, 0, 0.05), M["dark"], root, 20, 0.012, 1)
    mk_cyl("Zone_Shaft", 0.08, 1.4, (0, 0, 0.8), M["body"], root, 16, 0.01, 1)
    mk_cyl("Zone_Ring", 0.35, 0.06, (0, 0, 1.15), M["cyan"], root, 24, 0.008, 0)
    mk_cyl("Zone_Ring2", 0.28, 0.04, (0, 0, 1.35), M["gold"], root, 24, 0.006, 0)
    mk_uv_sphere("Zone_Cap", 0.18, (0, 0, 1.6), M["amber"], root, 16)
    mk_box("Zone_Banner", 0.02, 0.35, 0.7, (0.12, 0, 0.9), M["crystal"], root, 0.004, 0)
    return root


def select_hierarchy(root: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    for o in bpy.data.objects:
        if o.parent == root:
            o.select_set(True)
    bpy.context.view_layer.objects.active = root


def export_glb(root: bpy.types.Object, filename: str) -> str:
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, filename)
    select_hierarchy(root)
    # Hide other hero roots during export
    hidden = []
    for o in bpy.data.objects:
        if o.name.startswith("AR_") and o != root and o.type == "EMPTY":
            for child in bpy.data.objects:
                if child.parent == o:
                    if not child.hide_viewport:
                        child.hide_viewport = True
                        hidden.append(child)
            if not o.hide_viewport:
                o.hide_viewport = True
                hidden.append(o)
    # Blender 5.2 glTF exporter: keep kwargs conservative (export_colors removed).
    bpy.ops.export_scene.gltf(
        filepath=path,
        use_selection=True,
        export_format="GLB",
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_yup=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
    )
    for o in hidden:
        o.hide_viewport = False
    verts = sum(len(o.data.vertices) for o in bpy.data.objects if o.parent == root and o.type == "MESH")
    size = os.path.getsize(path) if os.path.exists(path) else 0
    print(f"Exported {filename}: verts~{verts} size={size}")
    return path


def main() -> None:
    clear_heroes()
    M = build_materials()
    player = build_player(M)
    terminal = build_terminal(M)
    blueprint = build_blueprint(M)
    zone = build_zone(M)

    export_glb(player, "riser-player.glb")
    export_glb(terminal, "algebra-terminal.glb")
    export_glb(blueprint, "blueprint-pad.glb")
    export_glb(zone, "zone-marker.glb")
    print("ALL_HEROES_EXPORTED", OUT_DIR)


if __name__ == "__main__":
    main()
