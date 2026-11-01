"""Builds partners.xlsx (+ one CSV per sheet) from the verified partner list.

Every row was checked on 1 November 2026 (official site or reliable secondary source).
Run: python3 partners/build_partners.py
"""
import csv
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

OUT = Path(__file__).parent
COLS = ["Name", "Type", "What they do", "Why relevant for EcoScape", "Possible role",
        "Public contact", "Source (checked 1 Nov 2026)", "Priority"]

NYC = [
    ["Forest for All NYC (coalition)", "Coalition (NGOs, business, academia, government)",
     "Coalition for a healthy, equitable urban forest; 200+ members, convened by The Nature Conservancy. Runs the annual City of Forest Day (Oct 2026).",
     "One door to many planting and stewardship groups; already working on the NYC Urban Forest Plan (Local Law 148).",
     "Visibility, introductions to planting partners",
     "https://forestforall.nyc/join-us/",
     "https://forestforall.nyc/ ; https://www.nature.org/en-us/about-us/where-we-work/united-states/new-york/stories-in-new-york/future-forest-nyc/",
     "High"],
    ["Trees New York", "Non-profit (urban forestry)",
     "Citizen Pruner training (licensed by NYC Parks), youth environmental education, school and neighbourhood tree plantings. Active 2026 (Trees for NYCHA, Cooling the Campus).",
     "Teaches tree care: our 'learn to maintain' module mirrors its mission. Has a corporate sponsorship and volunteering offer.",
     "Planter, educational content, stewardship of plantings",
     "https://treesny.org/get-involved/corporate-sponsorship/",
     "https://treesny.org/",
     "High"],
    ["New York Restoration Project (NYRP)", "Non-profit (parks, gardens, trees)",
     "Free tree giveaways with community partners since 2008: 3,750 trees distributed 4 Apr–16 May 2026, over 80,500 in total. Also community gardens and park restoration.",
     "Direct channel to distribute and plant real trees with residents; already funded by Bloomberg Philanthropies.",
     "Planter, tree supply",
     "https://nyrp.org/freetree",
     "https://www.nyrp.org/wp-content/uploads/2026/03/NYRP-TREE-GIVEAWAYS-2026-final.pdf",
     "High"],
    ["NYC Parks — Street Tree Planting / Forestry", "City agency",
     "Plants and maintains street trees; Neighborhood Tree Planting Program prioritises heat-vulnerable areas. Note: an Oct 2026 Council op-ed says individual tree requests are no longer accepted, while the official page still invites 311 requests.",
     "The authority for any street tree in NYC; publishes the tree data we use. (MillionTreesNYC was completed in 2015 per NYRP; its old domain now redirects to an unrelated site: do not cite it.)",
     "Data, planting authority, validation",
     "https://www.nycgovparks.org/trees/street-tree-planting",
     "https://council.nyc.gov/gale-brewer/2026/10/03/op-ed-nyc-plan-to-plant-more-trees-needs-all-helping/ ; https://data.cityofnewyork.us/d/hn5i-inap",
     "High"],
    ["NYC Parks GreenThumb", "City programme (community gardens)",
     "Supports 550+ community gardens with free materials, technical help and workshops; active 2026-27 programme guides.",
     "Best fit for the edible-garden and pollinator options in NYC.",
     "Planting sites, educational workshops",
     "https://www.nycgovparks.org/greenthumb",
     "https://www.nycgovparks.org/pagefiles/218/2026GreenThumbFallProgram-Guide__6a873fb9a4885.pdf",
     "High"],
    ["BetaNYC", "Civic-tech community",
     "Helps New Yorkers use open data and technology: RADAR data help desk, NYC School of Data, BetaBagels. Active Oct 2026.",
     "Credibility on open data; NYC School of Data 2027 call for proposals (deadline 6 Dec 2026) is a stage to present the prototype.",
     "Data advice, visibility, beta testers",
     "https://www.beta.nyc/our-work/get-involved/",
     "https://www.beta.nyc/",
     "High"],
    ["The Nature Conservancy — New York (Future Forest NYC)", "NGO",
     "Future Forest NYC (since 2019): science on canopy, convenes Forest for All NYC, engages New Yorkers in tree care.",
     "Source of canopy science and 'practical canopy' analysis to choose where to plant.",
     "Data/science, visibility",
     "https://www.nature.org/en-us/about-us/where-we-work/united-states/new-york/",
     "https://www.nature.org/en-us/about-us/where-we-work/united-states/new-york/stories-in-new-york/future-forest-nyc/",
     "Medium"],
    ["Bloomberg Philanthropies", "Foundation",
     "Large philanthropy active on cities and climate; thanked by NYRP for supporting its tree stewardship work (2026).",
     "Flagship climate and cities funder named in the brief; credibility if even a small grant or mention.",
     "Funder, visibility",
     "https://www.bloomberg.org/",
     "https://www.nyrp.org/wp-content/uploads/2026/03/NYRP-TREE-GIVEAWAYS-2026-final.pdf",
     "Medium"],
    ["NYC Economic Development Corporation (NYCEDC)", "Public development corporation",
     "Climate innovation programmes; BATWorks climate innovation hub at Brooklyn Army Terminal (opening expected 2028); 'Pilots at BAT' programme led by LACI from 2026.",
     "Possible pilot channel for climate-tech startups; mentioned in the brief.",
     "Pilot programme, visibility",
     "https://edc.nyc/program/climate-innovation",
     "https://www.esgdive.com/news/new-york-green-economy-climate-innovation-hub-brooklyn-BATWorks-NYCEDC/750052/",
     "Medium"],
    ["Brooklyn Grange (+ City Growers)", "Company (rooftop farms) + education non-profit",
     "Rooftop farms in NYC; partner non-profit City Growers runs farm-based K-12 education on its roofs; hosts corporate events.",
     "Showcase for edible urban planting; possible corporate-event venue for sponsor activations.",
     "Planting site, education, events",
     "https://www.brooklyngrangefarm.com/about",
     "https://www.brooklyngrangefarm.com/ ; https://www.nycfoodpolicy.org/?p=8108",
     "Medium"],
    ["NYC Open Data (Office of Technology and Innovation)", "City data platform",
     "Publishes Street Tree Census, Forestry Tree Points and Heat Vulnerability Index.",
     "Core data source for the NYC version of the map.",
     "Data",
     "https://opendata.cityofnewyork.us/",
     "https://data.cityofnewyork.us/d/uvpi-gqnh ; https://data.cityofnewyork.us/d/4mhf-duep",
     "Medium"],
]

PARIS = [
    ["Ville de Paris — Permis de végétaliser", "Local authority (City of Paris)",
     "Lets groups (associations, schools, businesses, 5+ residents) plant on public space: tree bases, de-paved ground, planters. Charter: local and bee-friendly plants, no pesticides, no plastic, year-round care. 1,732 permits in open data.",
     "The legal version of 'guerrilla gardening': EcoScape can be its digital front door.",
     "Legal framework, validation, visibility",
     "https://www.paris.fr/pages/un-permis-pour-vegetaliser-paris-2689",
     "https://www.paris.fr/pages/un-permis-pour-vegetaliser-paris-2689 ; https://opendata.paris.fr/explore/dataset/permis-de-vegetaliser/",
     "High"],
    ["Parisculteurs", "City urban-agriculture programme",
     "Calls for projects on rooftops, schoolyards and unused plots for urban agriculture (season 5 listed). Operator not named on site [À VÉRIFIER: City of Paris].",
     "Pipeline of real edible-planting sites in Paris.",
     "Planting sites, visibility",
     "https://www.parisculteurs.paris/fr/votre-projet/candidater-sur-un-site-disponible/",
     "https://www.parisculteurs.paris/",
     "High"],
    ["La SAUGE", "Association (urban agriculture)",
     "Runs or supports 6 urban farms in the Paris region, sells organic seeds, offers corporate solidarity days, training and volunteering. 2026 season active.",
     "Hands-on planting partner and a ready-made corporate offer for sponsors.",
     "Planter, educational content, sponsor activations",
     "https://www.lasauge.fr/pages/journees-solidaires-entreprises",
     "https://www.lasauge.fr/",
     "High"],
    ["Halage", "Association (work integration, horticulture)",
     "Green-space worksites for people far from employment; Fleurs d'Halage local flower production in Île-de-France; Lil'Ô biodiversity site. Urban-agriculture training Sept–Dec 2026.",
     "Local, ethical supplier of pollinator flowers plus a strong social-impact story.",
     "Planter, plant supply",
     "https://www.halage.fr/partenaires",
     "https://www.halage.fr/",
     "High"],
    ["botanic®", "Company (garden retail, société à mission)",
     "Garden-centre chain; removed synthetic pesticides and chemical fertilisers in 2008; société à mission since 2021; endowment fund for forests.",
     "Natural sponsor and plant supplier; its no-pesticide line matches the permis charter.",
     "Sponsor, plant supply, in-store visibility",
     "https://www.botanic.com/nous-connaitre/botanic-s-engage/botanic-s-engage.html",
     "https://www.botanic.com/nous-connaitre/botanic-s-engage/agir-pour-un-jardinage-plus-responsable.html",
     "High"],
    ["UNAF — Union Nationale de l'Apiculture Française", "Beekeepers' union",
     "Represents French beekeepers; 'Abeille, sentinelle de l'environnement' programme; APIcité label for local authorities. Reports 90% of surveyed beekeepers oppose GPS location of hives.",
     "Expert voice for the pollinator option. Design lesson: never geolocate hives in the app.",
     "Expertise, label, visibility",
     "https://www.unaf-apiculture.info/nos-actions/abeille-sentinelle-de-lenvironnement/",
     "https://www.unaf-apiculture.info/ ; https://www.unaf-apiculture.info/geolocalisation-ruchers-position-unaf/",
     "Medium"],
    ["Data For Good", "Civic-tech community",
     "Volunteer tech community (8,000 volunteers, 140 projects) on climate, social justice and democracy. Season 15 launches 7 Nov 2026.",
     "Possible volunteer support and credibility on open data; timing fits our project.",
     "Tech volunteers, visibility",
     "https://dataforgood.fr/",
     "https://dataforgood.fr/",
     "Medium"],
    ["AFAUP — Association Française de l'Agriculture Urbaine", "National network",
     "National urban-agriculture association; organises '48h de l'agriculture urbaine' (Apr 2026); manifesto 'Un quartier, une ferme'.",
     "Relay to urban farms across France; event to launch a challenge.",
     "Network, visibility",
     "https://www.afaup.org/contact",
     "https://www.afaup.org/",
     "Medium"],
    ["LPO — Refuges LPO", "NGO (biodiversity)",
     "Refuges LPO: France's network of wildlife-friendly gardens, with tracks for individuals, companies and local authorities.",
     "Label for planting sites; biodiversity credibility.",
     "Label, expertise",
     "https://www.lpo.fr/s-engager-a-nos-cotes/creer-un-refuge-lpo/dans-mon-entreprise",
     "https://www.lpo.fr/",
     "Medium"],
    ["CDC Biodiversité — Nature 2050", "Public-interest financier (nature-based solutions)",
     "Nature 2050 co-finances nature-based solutions incl. urban climate adaptation; 10th anniversary in 2026.",
     "Possible co-funding for heat-island plantings.",
     "Funder",
     "https://www.cdc-biodiversite.fr/",
     "https://www.cdc-biodiversite.fr/",
     "Medium"],
    ["Merci Raymond", "Company (urban gardening & design)",
     "Urban gardeners and designers: plant design, urban agriculture, maintenance, education (projects at La Villette, offices, campuses). No dated 2025-26 news on site.",
     "Professional planting/maintenance operator for corporate sponsors.",
     "Planter (paid), maintenance",
     "https://merciraymond.fr/devenez-raymond",
     "https://merciraymond.fr/",
     "Medium"],
    ["Kingfisher (Castorama, Brico Dépôt)", "Company RSE (DIY & garden retail)",
     "Signatory of act4nature international biodiversity commitments.",
     "Retail sponsor with garden ranges.",
     "Sponsor",
     "https://www.kingfisher.com/",
     "https://act4nature.com/entreprises-engagees-depuis-2020/",
     "Medium"],
    ["VINCI", "Company RSE (construction / BTP)",
     "Signatory of act4nature international.",
     "BTP sponsor for de-paving (désimperméabilisation) plantings.",
     "Sponsor",
     "https://www.vinci.com/",
     "https://act4nature.com/entreprises-engagees-depuis-2020/",
     "Medium"],
    ["Saint-Gobain", "Company RSE (materials / construction)",
     "Signatory of act4nature international.",
     "Materials and construction sponsor; Stavian-like industrial profile.",
     "Sponsor",
     "https://www.saint-gobain.com/",
     "https://act4nature.com/entreprises-engagees-depuis-2020/",
     "Medium"],
    ["Bouygues Construction", "Company RSE (construction / BTP)",
     "Signatory of act4nature international.",
     "BTP sponsor for urban sites.",
     "Sponsor",
     "https://www.bouygues-construction.com/",
     "https://act4nature.com/entreprises-engagees-depuis-2020/",
     "Low"],
    ["EDF", "Company RSE (energy)",
     "Signatory of act4nature international.",
     "Energy sponsor; heat/energy narrative.",
     "Sponsor",
     "https://www.edf.fr/",
     "https://act4nature.com/entreprises-engagees-depuis-2020/",
     "Low"],
    ["ENGIE", "Company RSE (energy)",
     "Signatory of act4nature international.",
     "Energy sponsor; heat/energy narrative.",
     "Sponsor",
     "https://www.engie.com/",
     "https://act4nature.com/entreprises-engagees-depuis-2020/",
     "Low"],
    ["Carrefour", "Company RSE (food retail)",
     "Signatory of act4nature international.",
     "Distribution sponsor for the edible-garden option.",
     "Sponsor, in-store visibility",
     "https://www.carrefour.com/",
     "https://act4nature.com/entreprises-engagees-depuis-2020/",
     "Low"],
    ["Noé", "NGO (biodiversity)",
     "Protects threatened species, builds a nature-friendly economy, reconnects people with nature; active 2026 (pesticides campaign).",
     "Biodiversity credibility; corporate partnership programme.",
     "Expertise, visibility",
     "https://noe.org/devenez-partenaire/",
     "https://noe.org/",
     "Low"],
    ["Reforest'Action", "Company (reforestation for companies)",
     "Since 2010, reforestation and regenerative agriculture projects funded by companies (650+ large companies). Mostly outside cities.",
     "Benchmark/competitor (French Treedom-like model); shows why our urban, educational angle differs.",
     "Benchmark",
     "https://www.reforestaction.com/contact",
     "https://www.reforestaction.com/",
     "Low"],
    ["Plantons pour l'Avenir", "Endowment fund (forestry)",
     "Since 2014, funds reforestation of French forests with 455 corporate sponsors.",
     "Forest-focused, not urban: useful benchmark of corporate tree sponsorship in France.",
     "Benchmark",
     "https://www.plantonspourlavenir.fr/devenez_mecene/",
     "https://www.plantonspourlavenir.fr/",
     "Low"],
]

PRIO_FILL = {"High": "D9EAD3", "Medium": "FFF2CC", "Low": "EFEFEF"}


def write_sheet(ws, rows):
    ws.append(COLS)
    for c in ws[1]:
        c.font = Font(bold=True, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor="1F4D3A")
        c.alignment = Alignment(vertical="center", wrap_text=True)
    for r in rows:
        ws.append(r)
    widths = [30, 24, 60, 50, 28, 45, 55, 10]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    for row in ws.iter_rows(min_row=2):
        for c in row:
            c.alignment = Alignment(vertical="top", wrap_text=True)
        row[-1].fill = PatternFill("solid", fgColor=PRIO_FILL[row[-1].value])
    ws.freeze_panes = "B2"
    ws.auto_filter.ref = ws.dimensions


wb = Workbook()
ws = wb.active
ws.title = "NYC"
write_sheet(ws, NYC)
write_sheet(wb.create_sheet("Paris-France"), PARIS)
wb.save(OUT / "partners.xlsx")

for name, rows in (("partners_nyc.csv", NYC), ("partners_paris_france.csv", PARIS)):
    with open(OUT / name, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(COLS)
        w.writerows(rows)

print(f"NYC: {len(NYC)} rows, Paris/France: {len(PARIS)} rows")
