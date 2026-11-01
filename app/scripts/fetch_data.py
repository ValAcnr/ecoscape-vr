"""Download real open data for the prototype neighbourhoods and write src/data/*.json.

Sources (checked 1 Nov 2026):
- Ville de Paris open data (ODbL): les-arbres, arbres-plantes-par-projet, permis-de-vegetaliser,
  ilots-de-fraicheur-espaces-verts-frais, fiches-essences-du-guide-des-essences-de-paris
- NYC Open Data: Forestry Tree Points (hn5i-inap), Heat Vulnerability Index (4mhf-duep)
- OpenStreetMap buildings via Overpass API (ODbL) for the VR scene

Heat zones: the prototype uses a transparent PROXY (cells with the lowest street-tree density).
Production would use the Cerema Local Climate Zones layer.
Run: python3 scripts/fetch_data.py
"""
import json, math, random, urllib.parse, urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "src" / "data"
OUT.mkdir(parents=True, exist_ok=True)
PARIS = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets"

HOODS = {
    "belleville":  {"city": "paris", "name": "Belleville", "district": "Paris 19e–20e", "bbox": [48.866, 2.372, 48.878, 2.392]},
    "goutte-dor":  {"city": "paris", "name": "La Goutte d'Or", "district": "Paris 18e", "bbox": [48.880, 2.345, 48.891, 2.362]},
    "butte-aux-cailles": {"city": "paris", "name": "Butte-aux-Cailles", "district": "Paris 13e", "bbox": [48.822, 2.342, 48.833, 2.360]},
    "bed-stuy":    {"city": "nyc", "name": "Bedford-Stuyvesant", "district": "Brooklyn", "bbox": [40.680, -73.955, 40.694, -73.930], "zips": ["11216", "11221", "11233"]},
}


def get(url, data=None):
    req = urllib.request.Request(url, data=data, headers={"User-Agent": "EcoScape-student-prototype/0.1"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))


def paris_export(dataset, bbox, select):
    s, w, n, e = bbox
    q = urllib.parse.urlencode({"where": f"in_bbox(geo_point_2d, {s}, {w}, {n}, {e})", "select": select})
    return get(f"{PARIS}/{dataset}/exports/json?{q}")


def pt(r, key="geo_point_2d"):
    g = r[key]
    return [round(g["lat"], 6), round(g["lon"], 6)]


def street_name(r):
    """Street trees only ('Alignement'); keep the street part of the address, title-cased."""
    if r.get("domanialite") != "Alignement" or not r.get("adresse"):
        return None
    a = r["adresse"].split("/")[-1].strip()
    a = " ".join(w for w in a.split() if not w.isdigit())
    small = {"DE", "DU", "DES", "LA", "LE", "L", "D", "ET"}
    words = [w.lower() if w in small else w.capitalize() for w in a.split()]
    out = " ".join(words).replace(" l ", " l'").replace(" d ", " d'")
    # Source data is upper-case without accents: restore the common ones for display.
    for a, b in {"Menilmontant": "Ménilmontant", "Compiegne": "Compiègne", "Abbe": "Abbé", "Henocque": "Hénocque",
                 "Glaciere": "Glacière", "Fontaine Au Roi": "Fontaine-au-Roi", "Docteur": "Docteur",
                 "Saint Louis": "Saint-Louis", "Saint Denis": "Saint-Denis", "Saint Vincent de Paul": "Saint-Vincent-de-Paul"}.items():
        out = out.replace(a, b)
    return out


def heat_proxy(trees, bbox, cell_m=110):
    """Grid over bbox; tree count within each cell; hottest = fewest trees. Returns cells with level 1-3."""
    s, w, n, e = bbox
    lat0 = (s + n) / 2
    dlat = cell_m / 111_320
    dlon = cell_m / (111_320 * math.cos(math.radians(lat0)))
    rows, cols = int((n - s) / dlat), int((e - w) / dlon)
    counts = [[0] * cols for _ in range(rows)]
    for la, lo in trees:
        i, j = int((la - s) / dlat), int((lo - w) / dlon)
        if 0 <= i < rows and 0 <= j < cols:
            counts[i][j] += 1
    cells = [(counts[i][j], i, j) for i in range(rows) for j in range(cols)]
    cells.sort()
    k = max(6, len(cells) // 6)  # hottest sixth of the grid
    out = []
    for rank, (c, i, j) in enumerate(cells[:k]):
        level = 3 if rank < k / 3 else 2 if rank < 2 * k / 3 else 1
        la, lo = s + i * dlat, w + j * dlon
        out.append({"level": level, "trees": c,
                    "poly": [[round(lo, 6), round(la, 6)], [round(lo + dlon, 6), round(la, 6)],
                             [round(lo + dlon, 6), round(la + dlat, 6)], [round(lo, 6), round(la + dlat, 6)]]})
    return out


def missions_from(heat, trees, hood_id, seed, addrs=None):
    """Place missions on the street-tree point nearest to the centre of the hottest cells (=> on a street)."""
    rnd = random.Random(seed)
    types = ["flowers", "flowers", "edible", "flowers", "tree", "edible", "flowers", "edible"]
    out, used = [], set()
    for cell in sorted(heat, key=lambda c: -c["level"]):
        if len(out) >= 8:
            break
        cx = sum(p[0] for p in cell["poly"]) / 4
        cy = sum(p[1] for p in cell["poly"]) / 4
        cand = [k for k in range(len(trees)) if addrs[k]] if addrs else list(range(len(trees)))
        bi = min(cand, key=lambda k: (trees[k][0] - cy) ** 2 + (trees[k][1] - cx) ** 2) if cand else None
        best = trees[bi] if bi is not None else [cy, cx]
        addr = addrs[bi] if (addrs and bi is not None) else None
        key = (round(best[0], 4), round(best[1], 4))
        if key in used:
            continue
        used.add(key)
        t = types[len(out) % len(types)]
        out.append({
            "id": f"{hood_id}-m{len(out)+1}",
            "lat": round(best[0] + rnd.uniform(-0.00008, 0.00008), 6),
            "lon": round(best[1] + rnd.uniform(-0.00008, 0.00008), 6),
            "type": t,
            "heat": cell["level"],
            "exposure": rnd.choice(["sun", "sun", "partial"]) if cell["level"] >= 2 else rnd.choice(["sun", "partial", "shade"]),
            "soil": rnd.choice(["dry", "dry", "fresh"]) if cell["level"] >= 2 else rnd.choice(["dry", "fresh", "moist"]),
            "site": {"flowers": "tree-base", "edible": "planter", "tree": "street"}[t],
            "addr": addr,
        })
    return out


def paris_hood(hid, h):
    bbox = h["bbox"]
    trees_raw = [r for r in paris_export("les-arbres", bbox, "genre,libellefrancais,adresse,domanialite,geo_point_2d") if r.get("geo_point_2d")]
    trees = [pt(r) for r in trees_raw]
    addrs = [street_name(r) for r in trees_raw]
    planted = paris_export("arbres-plantes-par-projet", bbox, "nom_projet,ind_arb_plant,date_fin_t,geo_point_2d")
    permits = paris_export("permis-de-vegetaliser", bbox, "rv_type,statut,rv_l_deb,geo_point_2d")
    cool = paris_export("ilots-de-fraicheur-espaces-verts-frais", bbox, "nom,type,geo_shape,geo_point_2d")
    heat = heat_proxy(trees, bbox)
    genus = {}
    for r in trees_raw:
        if r.get("libellefrancais"):
            genus[r["libellefrancais"]] = genus.get(r["libellefrancais"], 0) + 1
    return {
        "id": hid, **h,
        "center": [round((bbox[0] + bbox[2]) / 2, 6), round((bbox[1] + bbox[3]) / 2, 6)],
        "stats": {"trees": len(trees), "topSpecies": sorted(genus.items(), key=lambda x: -x[1])[:5],
                  "permits": len(permits), "plantingProjects": len(planted), "coolIslands": len(cool)},
        "trees": trees,
        "permits": [{"p": pt(r), "type": r.get("rv_type"), "addr": r.get("rv_l_deb")} for r in permits if r.get("geo_point_2d")],
        "planted": [{"p": pt(r), "name": r.get("nom_projet"), "n": r.get("ind_arb_plant")} for r in planted if r.get("geo_point_2d")],
        "cool": [{"name": r.get("nom"), "geom": r["geo_shape"]["geometry"]} for r in cool if r.get("geo_shape")],
        "heat": heat,
        "missions": missions_from(heat, trees, hid, hid, addrs),
        "sources": ["Ville de Paris — Paris Data (ODbL)", "Heat zones: prototype proxy (lowest street-tree density); production: Cerema LCZ"],
    }


def nyc_hood(hid, h):
    s, w, n, e = h["bbox"]
    q = urllib.parse.urlencode({"$where": f"within_box(location, {n}, {w}, {s}, {e}) AND tpstructure='Full'",
                                "$select": "location,genusspecies", "$limit": "20000"})
    rows = get(f"https://data.cityofnewyork.us/resource/hn5i-inap.json?{q}")
    trees = [[round(r["location"]["coordinates"][1], 6), round(r["location"]["coordinates"][0], 6)] for r in rows if r.get("location")]
    hvi = get("https://data.cityofnewyork.us/resource/4mhf-duep.json?$limit=500")
    hvi_z = {r["zcta20"]: int(r["hvi"]) for r in hvi if r.get("zcta20") in h["zips"]}
    heat = heat_proxy(trees, h["bbox"])
    sp = {}
    for r in rows:
        name = (r.get("genusspecies") or "").split(" - ")[-1]
        if name:
            sp[name] = sp.get(name, 0) + 1
    return {
        "id": hid, **h,
        "center": [round((s + n) / 2, 6), round((w + e) / 2, 6)],
        "stats": {"trees": len(trees), "topSpecies": sorted(sp.items(), key=lambda x: -x[1])[:5], "hviByZip": hvi_z},
        "trees": trees, "permits": [], "planted": [], "cool": [],
        "heat": heat,
        "missions": missions_from(heat, trees, hid, hid),
        "sources": ["NYC Parks — Forestry Tree Points (NYC Open Data)", "NYC DOHMH — Heat Vulnerability Index (NYC Open Data)",
                    "Heat zones: prototype proxy (lowest street-tree density)"],
    }


def guide():
    rows = get(f"{PARIS}/fiches-essences-du-guide-des-essences-de-paris/exports/json")
    out = []
    for r in rows:
        exp = [k for k, f in (("sun", "exposition_possible_soleil"), ("partial", "exposition_possible_mi_ombre"), ("shade", "exposition_possible_ombre")) if r.get(f) == "oui"]
        soil = [k for k, f in (("dry", "besoins_en_eau_type_de_sol_tolere_sec_tres_sec"), ("fresh", "besoins_en_eau_type_de_sol_tolere_mesophile"),
                               ("moist", "besoins_en_eau_type_de_sol_tolere_intermediaire_frais"), ("wet", "besoins_en_eau_type_de_sol_tolere_humide")) if r.get(f) == "oui"]
        out.append({"common": r.get("nom_commun"), "latin": r.get("nom_latin"), "size": r.get("taille_de_developpement"),
                    "street": r.get("site_de_plantation_possible_alignement") == "oui", "exposure": exp, "soil": soil,
                    "native": r.get("indigenat"), "flowers": r.get("arbre_a_fleurs") == "Oui"})
    return [g for g in out if g["common"] and g["exposure"] and g["soil"]]


def buildings(bbox):
    s, w, n, e = bbox
    q = f'[out:json][timeout:60];way["building"]({s},{w},{n},{e});out tags geom;'
    data = None
    for ep in ("https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter",
               "https://overpass.kumi.systems/api/interpreter"):
        try:
            data = get(ep, data=urllib.parse.urlencode({"data": q}).encode())
            break
        except Exception as exc:  # public mirrors are sometimes overloaded
            print("overpass mirror failed:", ep, exc)
    if data is None:
        return None
    out = []
    for el in data.get("elements", []):
        g = el.get("geometry")
        if not g or len(g) < 4:
            continue
        tags = el.get("tags", {})
        lv = tags.get("building:levels")
        try:
            h = float(tags.get("height") or (float(lv) * 3.2 if lv else 15))
        except ValueError:
            h = 15
        out.append({"h": round(h, 1), "pts": [[round(p["lat"], 6), round(p["lon"], 6)] for p in g]})
    return out


if __name__ == "__main__":
    import sys
    only_vr = "--vr-only" in sys.argv
    for hid, h in HOODS.items():
        if only_vr:
            break
        d = paris_hood(hid, h) if h["city"] == "paris" else nyc_hood(hid, h)
        (OUT / f"hood-{hid}.json").write_text(json.dumps(d, ensure_ascii=False, separators=(",", ":")))
        print(hid, d["stats"]["trees"], "trees,", len(d["heat"]), "heat cells,", len(d["missions"]), "missions")
    g = guide() if not only_vr else json.loads((OUT / "species-guide.json").read_text())
    (OUT / "species-guide.json").write_text(json.dumps(g, ensure_ascii=False, separators=(",", ":")))
    print("guide", len(g), "species")
    # VR scene: ~350 m square around the first Belleville mission
    bel = json.loads((OUT / "hood-belleville.json").read_text())
    m = bel["missions"][0]
    d = 0.0016
    b = buildings([m["lat"] - d, m["lon"] - d * 1.5, m["lat"] + d, m["lon"] + d * 1.5])
    if b is None:
        prev = OUT / "vr-belleville.json"
        b = json.loads(prev.read_text())["buildings"] if prev.exists() else []
        print("Overpass unavailable: keeping previous buildings", len(b))
    (OUT / "vr-belleville.json").write_text(json.dumps({"origin": [m["lat"], m["lon"]], "mission": m,
        "buildings": b, "trees": [t for t in bel["trees"] if abs(t[0] - m["lat"]) < d and abs(t[1] - m["lon"]) < d * 1.5],
        "heat": bel["heat"]}, separators=(",", ":")))
    print("vr buildings", len(b))
