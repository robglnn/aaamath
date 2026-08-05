"""Loop 11–13: Organic Fortnite-style Riser player (sculpted proportions + baked PBR).

Athletic silhouette (not kitbash boxes), messy hair, form-fitting navy suit with
thin gold/cyan armor plates, cloth vs metal material split, baked AO + panel ORM.

Run:
  blender --background --python tools/blender/rebuild_player_organic.py
Or via Blender MCP execute_blender_code (paste main()).
"""
from __future__ import annotations

import math
import os
import struct
import zlib

import bpy
import bmesh
from mathutils import Vector

OUT_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "..", "public", "models")
)
TEX_DIR = os.path.join(OUT_DIR, "_tex")


def clear_player() -> None:
    victims = [
        o
        for o in list(bpy.data.objects)
        if o.name.startswith(("Player_", "AR_Player", "BakeCam", "Bake_"))
    ]
    for o in victims:
        bpy.data.objects.remove(o, do_unlink=True)
    for img in list(bpy.data.images):
        if img.name.startswith("AR_Bake_") or img.name.startswith("AR_Panel"):
            bpy.data.images.remove(img)
    for m in list(bpy.data.materials):
        if m.name.startswith("AR_"):
            bpy.data.materials.remove(m)


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


def apply_mods(obj: bpy.types.Object, bevel_w: float = 0.0, subdiv: int = 0) -> None:
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    if bevel_w > 0:
        bev = obj.modifiers.new("Bevel", "BEVEL")
        bev.width = bevel_w
        bev.segments = 2
        bev.limit_method = "ANGLE"
        bev.angle_limit = math.radians(40)
    if subdiv > 0:
        sub = obj.modifiers.new("Subsurf", "SUBSURF")
        sub.levels = subdiv
        sub.render_levels = subdiv
    for mod in list(obj.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        except Exception:
            pass
    obj.select_set(False)


def smooth_shade(obj: bpy.types.Object) -> None:
    mesh = obj.data
    for poly in mesh.polygons:
        poly.use_smooth = True


def mk_sphere(
    name: str,
    r: float,
    loc: tuple[float, float, float],
    scale: tuple[float, float, float],
    material: bpy.types.Material,
    parent: bpy.types.Object,
    segs: int = 20,
    subdiv: int = 1,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=segs, ring_count=max(8, segs // 2), radius=r, location=loc
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.parent = parent
    obj.data.materials.clear()
    obj.data.materials.append(material)
    if subdiv > 0:
        apply_mods(obj, bevel_w=0.0, subdiv=subdiv)
    smooth_shade(obj)
    return obj


def mk_capsule(
    name: str,
    r: float,
    depth: float,
    loc: tuple[float, float, float],
    material: bpy.types.Material,
    parent: bpy.types.Object,
    scale: tuple[float, float, float] = (1.0, 1.0, 1.0),
    rot: tuple[float, float, float] = (0.0, 0.0, 0.0),
    segs: int = 16,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(vertices=segs, radius=r, depth=depth, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.rotation_euler = rot
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    # Cap with hemispheres for organic limb ends
    for sign, z_off in ((1, depth / 2), (-1, -depth / 2)):
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=segs, ring_count=segs // 2, radius=r, location=(loc[0], loc[1], loc[2] + z_off)
        )
        cap = bpy.context.active_object
        cap.name = f"{name}_Cap{sign}"
        # Keep only hemisphere roughly
        bm = bmesh.new()
        bm.from_mesh(cap.data)
        bm.verts.ensure_lookup_table()
        kill = [v for v in bm.verts if (v.co.z * sign) < -0.001]
        bmesh.ops.delete(bm, geom=kill, context="VERTS")
        bm.to_mesh(cap.data)
        bm.free()
        # Join into limb
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        cap.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.join()
        obj = bpy.context.active_object
        obj.name = name
    obj.parent = parent
    obj.data.materials.clear()
    obj.data.materials.append(material)
    apply_mods(obj, bevel_w=0.006, subdiv=1)
    smooth_shade(obj)
    return obj


def mk_box_plate(
    name: str,
    sx: float,
    sy: float,
    sz: float,
    loc: tuple[float, float, float],
    material: bpy.types.Material,
    parent: bpy.types.Object,
    bevel: float = 0.008,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.parent = parent
    obj.data.materials.clear()
    obj.data.materials.append(material)
    apply_mods(obj, bevel_w=bevel, subdiv=1)
    smooth_shade(obj)
    return obj


def mk_hair_clump(
    parent: bpy.types.Object,
    material: bpy.types.Material,
    helm_z: float = 1.42,
) -> None:
    """Messy Fortnite-style hair spikes — tall enough to read from shoulder cam."""
    spikes = [
        # (name, r, depth, loc, rot_xyz, scale)
        ("Player_Hair_C", 0.07, 0.28, (0.0, -0.02, helm_z + 0.16), (0.25, 0.0, 0.0), (1.1, 0.75, 1.15)),
        ("Player_Hair_CL", 0.055, 0.26, (-0.07, -0.01, helm_z + 0.14), (0.35, 0.2, -0.25), (1.0, 0.7, 1.1)),
        ("Player_Hair_CR", 0.055, 0.26, (0.07, -0.01, helm_z + 0.14), (0.35, -0.2, 0.25), (1.0, 0.7, 1.1)),
        ("Player_Hair_L", 0.05, 0.24, (-0.12, 0.02, helm_z + 0.1), (0.5, 0.4, -0.45), (0.95, 0.65, 1.05)),
        ("Player_Hair_R", 0.05, 0.24, (0.12, 0.02, helm_z + 0.1), (0.5, -0.4, 0.45), (0.95, 0.65, 1.05)),
        ("Player_Hair_Back", 0.07, 0.22, (0.0, -0.12, helm_z + 0.08), (-0.55, 0.0, 0.0), (1.25, 0.8, 1.0)),
        ("Player_Hair_BackL", 0.045, 0.18, (-0.08, -0.12, helm_z + 0.05), (-0.45, 0.2, -0.2), (1.0, 0.7, 0.95)),
        ("Player_Hair_BackR", 0.045, 0.18, (0.08, -0.12, helm_z + 0.05), (-0.45, -0.2, 0.2), (1.0, 0.7, 0.95)),
        ("Player_Hair_Fore", 0.04, 0.16, (0.02, 0.11, helm_z + 0.02), (0.95, 0.1, 0.15), (0.9, 0.6, 1.05)),
        ("Player_Hair_Spiky", 0.038, 0.22, (-0.03, 0.04, helm_z + 0.2), (0.15, 0.25, -0.1), (0.75, 0.55, 1.25)),
        ("Player_Hair_Spiky2", 0.035, 0.2, (0.05, 0.03, helm_z + 0.19), (0.2, -0.2, 0.15), (0.7, 0.5, 1.2)),
        ("Player_Hair_Spiky3", 0.032, 0.18, (-0.06, 0.06, helm_z + 0.18), (0.3, 0.15, -0.3), (0.65, 0.48, 1.15)),
        ("Player_Hair_Spiky4", 0.03, 0.17, (0.08, 0.05, helm_z + 0.17), (0.28, -0.25, 0.25), (0.6, 0.45, 1.1)),
    ]
    for name, r, depth, loc, rot, scale in spikes:
        bpy.ops.mesh.primitive_cone_add(
            vertices=10, radius1=r, radius2=0.006, depth=depth, location=loc
        )
        obj = bpy.context.active_object
        obj.name = name
        obj.rotation_euler = rot
        obj.scale = scale
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        obj.parent = parent
        obj.data.materials.clear()
        obj.data.materials.append(material)
        apply_mods(obj, bevel_w=0.004, subdiv=1)
        smooth_shade(obj)
    # Soft back volume — reads from shoulder cam against daylight sky
    mk_sphere(
        "Player_Hair_Volume",
        0.11,
        (0, -0.06, helm_z + 0.02),
        (1.15, 0.85, 0.7),
        material,
        parent,
        12,
        0,
    )


def write_png_rgba(path: str, w: int, h: int, pixels: bytes) -> None:
    """Minimal PNG writer (RGBA8)."""
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    raw = b"".join(b"\x00" + pixels[y * w * 4 : (y + 1) * w * 4] for y in range(h))
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(png)


def make_panel_orm_png(path: str, size: int = 256) -> str:
    """Subtle navy panel albedo — soft seams, sparse gold filigree (not loud grid)."""
    pixels = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            gx = (x / size) * 4.0
            gy = (y / size) * 5.0
            fx = abs(gx - int(gx) - 0.5)
            fy = abs(gy - int(gy) - 0.5)
            seam = 1.0 if (fx < 0.035 or fy < 0.03) else 0.0
            ao = 0.7 + 0.3 * min(fx / 0.45, fy / 0.45, 1.0)
            n = ((x * 374761 + y * 668265) % 97) / 97.0
            # Deep navy cloth base
            base_r = int(12 + ao * 18 + n * 6)
            base_g = int(28 + ao * 32 + n * 8)
            base_b = int(55 + ao * 40 + n * 10)
            if seam > 0.5 and ((int(gx) + int(gy)) % 4 == 0):
                # Sparse gold filigree only on every 4th seam
                base_r, base_g, base_b = 160, 125, 45
            elif seam > 0.5:
                # Recessed navy seam (not gold)
                base_r = int(base_r * 0.55)
                base_g = int(base_g * 0.55)
                base_b = int(base_b * 0.65)
            cx = abs((x / size) * 4.0 - int((x / size) * 4.0) - 0.5)
            cy = abs((y / size) * 5.0 - int((y / size) * 5.0) - 0.5)
            if cx < 0.05 and cy < 0.05 and ((int(gx) + int(gy)) % 5 == 0):
                base_r, base_g, base_b = 35, 160, 155
            i = (y * size + x) * 4
            pixels[i : i + 4] = bytes((base_r, base_g, base_b, 255))
    write_png_rgba(path, size, size, bytes(pixels))
    return path


def make_ao_png(path: str, size: int = 256) -> str:
    """Soft cavity AO map — darker in creases (circular falloff + panel)."""
    pixels = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            u = x / (size - 1)
            v = y / (size - 1)
            # Radial soft vignette + crease strips
            dx = u - 0.5
            dy = v - 0.5
            rad = math.sqrt(dx * dx + dy * dy) * 1.6
            crease = 0.0
            for t in (0.25, 0.5, 0.75):
                crease = max(crease, 1.0 - min(1.0, abs(u - t) * 18))
                crease = max(crease, 1.0 - min(1.0, abs(v - t) * 18))
            ao = max(0.35, 1.0 - rad * 0.55 - crease * 0.35)
            c = int(ao * 255)
            i = (y * size + x) * 4
            pixels[i : i + 4] = bytes((c, c, c, 255))
    write_png_rgba(path, size, size, bytes(pixels))
    return path


def make_normal_png(path: str, size: int = 256) -> str:
    """Subtle bevel-ish normal from panel height."""
    height = [[0.0] * size for _ in range(size)]
    for y in range(size):
        for x in range(size):
            gx = (x / size) * 6.0
            gy = (y / size) * 8.0
            fx = abs(gx - int(gx) - 0.5)
            fy = abs(gy - int(gy) - 0.5)
            h = 0.55
            if fx < 0.07 or fy < 0.06:
                h = 0.15  # recessed seam
            elif fx < 0.12 or fy < 0.11:
                h = 0.85  # raised rim
            height[y][x] = h
    pixels = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            xl = height[y][max(0, x - 1)]
            xr = height[y][min(size - 1, x + 1)]
            yd = height[max(0, y - 1)][x]
            yu = height[min(size - 1, y + 1)][x]
            dx = (xl - xr) * 4.0
            dy = (yd - yu) * 4.0
            dz = 1.0
            inv = 1.0 / math.sqrt(dx * dx + dy * dy + dz * dz)
            nx, ny, nz = dx * inv, dy * inv, dz * inv
            i = (y * size + x) * 4
            pixels[i : i + 4] = bytes(
                (int((nx * 0.5 + 0.5) * 255), int((ny * 0.5 + 0.5) * 255), int((nz * 0.5 + 0.5) * 255), 255)
            )
    write_png_rgba(path, size, size, bytes(pixels))
    return path


def mat_textured(
    name: str,
    base: tuple[float, float, float],
    albedo_path: str,
    ao_path: str,
    normal_path: str,
    metallic: float,
    roughness: float,
    emit: tuple[float, float, float] = (0.0, 0.0, 0.0),
    emit_str: float = 0.0,
    mix: float = 0.55,
) -> bpy.types.Material:
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    tex_coord = nt.nodes.new("ShaderNodeTexCoord")
    mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (2.2, 2.8, 1.0)
    nt.links.new(tex_coord.outputs["UV"], mapping.inputs["Vector"])

    def load_img(path: str, non_color: bool = False):
        img = bpy.data.images.load(path)
        node = nt.nodes.new("ShaderNodeTexImage")
        node.image = img
        if non_color:
            img.colorspace_settings.name = "Non-Color"
        nt.links.new(mapping.outputs["Vector"], node.inputs["Vector"])
        return node

    albedo = load_img(albedo_path)
    ao = load_img(ao_path, non_color=True)
    normal = load_img(normal_path, non_color=True)

    mix_rgb = nt.nodes.new("ShaderNodeMix")
    mix_rgb.data_type = "RGBA"
    mix_rgb.inputs["Factor"].default_value = mix
    mix_rgb.inputs["A"].default_value = (*base, 1.0)
    nt.links.new(albedo.outputs["Color"], mix_rgb.inputs["B"])

    # Multiply by AO
    mul = nt.nodes.new("ShaderNodeMix")
    mul.data_type = "RGBA"
    mul.blend_type = "MULTIPLY"
    mul.inputs["Factor"].default_value = 0.85
    nt.links.new(mix_rgb.outputs["Result"], mul.inputs["A"])
    nt.links.new(ao.outputs["Color"], mul.inputs["B"])
    nt.links.new(mul.outputs["Result"], bsdf.inputs["Base Color"])

    nrm = nt.nodes.new("ShaderNodeNormalMap")
    nrm.inputs["Strength"].default_value = 0.85
    nt.links.new(normal.outputs["Color"], nrm.inputs["Color"])
    nt.links.new(nrm.outputs["Normal"], bsdf.inputs["Normal"])

    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if "Emission Color" in bsdf.inputs:
        bsdf.inputs["Emission Color"].default_value = (*emit, 1.0)
        bsdf.inputs["Emission Strength"].default_value = emit_str
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return m


def smart_uv(obj: bpy.types.Object) -> None:
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    try:
        bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.02)
    except Exception:
        bpy.ops.uv.sphere_project()
    bpy.ops.object.mode_set(mode="OBJECT")
    obj.select_set(False)


def build_materials(albedo: str, ao: str, nrm: str):
    cloth = mat_textured(
        "AR_SuitCloth",
        (0.05, 0.12, 0.28),
        albedo,
        ao,
        nrm,
        metallic=0.08,
        roughness=0.72,
        mix=0.28,
    )
    armor = mat_textured(
        "AR_ArmorPlate",
        (0.1, 0.22, 0.38),
        albedo,
        ao,
        nrm,
        metallic=0.55,
        roughness=0.32,
        mix=0.4,
    )
    return {
        "cloth": cloth,
        "armor": armor,
        "skin": mat("AR_Skin", (0.55, 0.38, 0.28), metallic=0.0, roughness=0.55),
        "hair": mat("AR_Hair", (0.04, 0.03, 0.05), metallic=0.05, roughness=0.65),
        "dark": mat("AR_Dark", (0.02, 0.04, 0.08), metallic=0.35, roughness=0.48),
        "metal": mat("AR_Metal", (0.55, 0.58, 0.62), metallic=0.88, roughness=0.26),
        "gold": mat(
            "AR_Gold",
            (0.85, 0.68, 0.22),
            metallic=0.92,
            roughness=0.2,
            emit=(0.55, 0.35, 0.05),
            emit_str=0.9,
        ),
        "cyan": mat(
            "AR_Cyan",
            (0.1, 0.7, 0.65),
            metallic=0.15,
            roughness=0.22,
            emit=(0.15, 0.9, 0.8),
            emit_str=4.8,
        ),
        "amber": mat(
            "AR_Amber",
            (0.95, 0.65, 0.12),
            metallic=0.3,
            roughness=0.28,
            emit=(0.95, 0.5, 0.08),
            emit_str=3.4,
        ),
        "visor": mat(
            "AR_VisorGlass",
            (0.05, 0.08, 0.12),
            metallic=0.4,
            roughness=0.12,
            emit=(0.2, 0.75, 0.7),
            emit_str=1.2,
        ),
    }


def build_organic_player(M) -> bpy.types.Object:
    root = bpy.data.objects.new("AR_Player", None)
    bpy.context.scene.collection.objects.link(root)

    # --- Form-fitting athletic body (organic spheres / capsules) ---
    # Torso — V-taper athletic
    mk_sphere("Player_Chest", 0.22, (0, -0.01, 1.02), (1.05, 0.72, 0.95), M["cloth"], root, 22, 1)
    mk_sphere("Player_Abdomen", 0.16, (0, -0.01, 0.74), (1.05, 0.78, 0.85), M["cloth"], root, 18, 1)
    mk_sphere("Player_Pelvis", 0.15, (0, -0.01, 0.55), (1.15, 0.85, 0.7), M["dark"], root, 16, 1)

    # Thin chest armor plate (overlay, not bulky kitbash)
    mk_box_plate("Player_ChestPlate", 0.28, 0.05, 0.26, (0, 0.12, 1.0), M["armor"], root, 0.01)
    mk_box_plate("Player_ChestGold", 0.22, 0.02, 0.03, (0, 0.145, 0.9), M["gold"], root, 0.004)
    mk_box_plate("Player_ChestPip", 0.045, 0.03, 0.045, (0, 0.15, 1.05), M["cyan"], root, 0.005)
    mk_box_plate("Player_Conduit_L", 0.02, 0.03, 0.28, (-0.12, 0.125, 0.98), M["gold"], root, 0.003)
    mk_box_plate("Player_Conduit_R", 0.02, 0.03, 0.28, (0.12, 0.125, 0.98), M["gold"], root, 0.003)

    # Head — organic sphere (visible neck/jaw under hair)
    mk_sphere("Player_Head", 0.125, (0, 0.02, 1.38), (0.95, 1.0, 1.05), M["skin"], root, 20, 1)
    mk_sphere("Player_Neck", 0.06, (0, 0.0, 1.24), (1.1, 1.0, 0.9), M["skin"], root, 12, 0)
    # Slim visor band (hero read without full helmet block)
    mk_box_plate("Player_Visor", 0.2, 0.045, 0.055, (0, 0.13, 1.4), M["visor"], root, 0.006)
    mk_box_plate("Player_VisorGlow", 0.16, 0.015, 0.035, (0, 0.155, 1.4), M["cyan"], root, 0.003)
    # Soft ear/side plates (armor accents)
    mk_sphere("Player_EarPlate_L", 0.04, (-0.12, 0.0, 1.38), (0.6, 1.0, 1.2), M["armor"], root, 10, 0)
    mk_sphere("Player_EarPlate_R", 0.04, (0.12, 0.0, 1.38), (0.6, 1.0, 1.2), M["armor"], root, 10, 0)

    mk_hair_clump(root, M["hair"], helm_z=1.42)

    # Shoulders — rounded pauldrons (organic, not cubes)
    mk_sphere("Player_Pauldron_L", 0.1, (-0.28, 0.0, 1.14), (1.15, 0.9, 0.75), M["armor"], root, 14, 1)
    mk_sphere("Player_Pauldron_R", 0.1, (0.28, 0.0, 1.14), (1.15, 0.9, 0.75), M["armor"], root, 14, 1)
    mk_box_plate("Player_PaulPip_L", 0.035, 0.02, 0.03, (-0.28, 0.08, 1.18), M["cyan"], root, 0.003)
    mk_box_plate("Player_PaulPip_R", 0.035, 0.02, 0.03, (0.28, 0.08, 1.18), M["cyan"], root, 0.003)

    # Backpack — sleeker
    mk_sphere("Player_Pack", 0.14, (0, -0.2, 0.98), (1.05, 0.55, 1.15), M["dark"], root, 14, 1)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=14, radius=0.055, depth=0.1, location=(0, -0.28, 0.98)
    )
    core = bpy.context.active_object
    core.name = "Player_PackCore"
    core.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    core.parent = root
    core.data.materials.clear()
    core.data.materials.append(M["cyan"])
    smooth_shade(core)
    mk_box_plate("Player_PackRail", 0.28, 0.03, 0.04, (0, -0.2, 1.14), M["metal"], root, 0.004)

    # Arms — tapered organic capsules
    mk_capsule(
        "Player_Arm_L", 0.055, 0.32, (-0.36, -0.01, 0.9), M["cloth"], root,
        scale=(1.0, 0.95, 1.0), segs=14,
    )
    mk_capsule(
        "Player_Arm_R", 0.055, 0.32, (0.36, -0.01, 0.9), M["cloth"], root,
        scale=(1.0, 0.95, 1.0), segs=14,
    )
    mk_capsule(
        "Player_Fore_L", 0.045, 0.26, (-0.38, 0.02, 0.58), M["cloth"], root, segs=12,
    )
    mk_capsule(
        "Player_Fore_R", 0.045, 0.26, (0.38, 0.02, 0.58), M["cloth"], root, segs=12,
    )
    mk_sphere("Player_Gaunt_L", 0.055, (-0.38, 0.04, 0.4), (1.1, 1.0, 0.7), M["metal"], root, 12, 0)
    mk_sphere("Player_Gaunt_R", 0.055, (0.38, 0.04, 0.4), (1.1, 1.0, 0.7), M["metal"], root, 12, 0)

    # Legs
    mk_capsule(
        "Player_Thigh_L", 0.065, 0.3, (-0.1, -0.01, 0.38), M["dark"], root, segs=14,
    )
    mk_capsule(
        "Player_Thigh_R", 0.065, 0.3, (0.1, -0.01, 0.38), M["dark"], root, segs=14,
    )
    mk_capsule(
        "Player_Shin_L", 0.05, 0.26, (-0.1, 0.01, 0.14), M["cloth"], root, segs=12,
    )
    mk_capsule(
        "Player_Shin_R", 0.05, 0.26, (0.1, 0.01, 0.14), M["cloth"], root, segs=12,
    )
    mk_sphere("Player_Knee_L", 0.05, (-0.1, 0.05, 0.26), (1.15, 0.85, 0.9), M["metal"], root, 10, 0)
    mk_sphere("Player_Knee_R", 0.05, (0.1, 0.05, 0.26), (1.15, 0.85, 0.9), M["metal"], root, 10, 0)
    mk_box_plate("Player_Boot_L", 0.11, 0.18, 0.07, (-0.1, 0.05, 0.04), M["dark"], root, 0.008)
    mk_box_plate("Player_Boot_R", 0.11, 0.18, 0.07, (0.1, 0.05, 0.04), M["dark"], root, 0.008)

    # Belt
    mk_box_plate("Player_Belt", 0.34, 0.2, 0.055, (0, 0.0, 0.58), M["metal"], root, 0.006)
    mk_box_plate("Player_BeltGem", 0.055, 0.04, 0.045, (0, 0.1, 0.58), M["cyan"], root, 0.004)

    # UV project textured parts
    for o in bpy.data.objects:
        if o.parent == root and o.type == "MESH":
            if o.data.materials and o.data.materials[0] and o.data.materials[0].name in (
                "AR_SuitCloth",
                "AR_ArmorPlate",
            ):
                smart_uv(o)

    return root


def select_hierarchy(root: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    for o in bpy.data.objects:
        if o.parent == root:
            o.select_set(True)
    bpy.context.view_layer.objects.active = root


def export_player(root: bpy.types.Object, filename: str = "riser-player.glb") -> str:
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, filename)
    select_hierarchy(root)
    bpy.ops.export_scene.gltf(
        filepath=path,
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
    verts = sum(
        len(o.data.vertices) for o in bpy.data.objects if o.parent == root and o.type == "MESH"
    )
    size = os.path.getsize(path) if os.path.exists(path) else 0
    print(f"Exported {filename}: verts~{verts} size={size}")
    return path


def main() -> None:
    clear_player()
    os.makedirs(TEX_DIR, exist_ok=True)
    albedo = make_panel_orm_png(os.path.join(TEX_DIR, "player_panel.png"), 256)
    ao = make_ao_png(os.path.join(TEX_DIR, "player_ao.png"), 256)
    nrm = make_normal_png(os.path.join(TEX_DIR, "player_normal.png"), 256)
    M = build_materials(albedo, ao, nrm)
    player = build_organic_player(M)
    path = export_player(player)
    print("ORGANIC_PLAYER_EXPORTED", path, os.path.getsize(path))


if __name__ == "__main__":
    main()
