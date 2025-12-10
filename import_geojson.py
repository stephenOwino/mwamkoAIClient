# import json
# import psycopg2

# # Database connection
# conn = psycopg2.connect(
#     dbname="your_database",
#     user="your_user",
#     password="your_password",
#     host="localhost"
# )
# cur = conn.cursor()

# # Create tables
# cur.execute("""
#     CREATE TABLE IF NOT EXISTS road_segments (
#         id SERIAL PRIMARY KEY,
#         properties JSONB,
#         geom GEOMETRY(LineString, 4326)
#     );
# """)

# cur.execute("""
#     CREATE TABLE IF NOT EXISTS road_segments_vertices_pgr (
#         id SERIAL PRIMARY KEY,
#         x_coord DOUBLE PRECISION,
#         y_coord DOUBLE PRECISION,
#         geom GEOMETRY(Point, 4326)
#     );
# """)

# cur.execute("""
#     CREATE TABLE IF NOT EXISTS constraints (
#         id SERIAL PRIMARY KEY,
#         properties JSONB,
#         geom GEOMETRY(Polygon, 4326)
#     );
# """)

# # Load and insert road_segments
# with open('public/data/road_segments.geojson', 'r') as f:
#     data = json.load(f)
#     for feature in data['features']:
#         coords = feature['geometry']['coordinates']
#         linestring = f"LINESTRING({','.join([f'{c[0]} {c[1]}' for c in coords])})"
#         cur.execute(
#             "INSERT INTO road_segments (properties, geom) VALUES (%s, ST_GeomFromText(%s, 4326))",
#             (json.dumps(feature['properties']), linestring)
#         )

# # Load and insert vertices
# with open('public/data/road_segments_vertices_pgr.geojson', 'r') as f:
#     data = json.load(f)
#     for feature in data['features']:
#         coords = feature['geometry']['coordinates']
#         props = feature['properties']
#         cur.execute(
#             "INSERT INTO road_segments_vertices_pgr (x_coord, y_coord, geom) VALUES (%s, %s, ST_GeomFromText(%s, 4326))",
#             (props.get('x_coord', coords[0]), props.get('y_coord', coords[1]), f"POINT({coords[0]} {coords[1]})")
#         )

# # Load and insert constraints
# with open('public/data/constraints.geojson', 'r') as f:
#     data = json.load(f)
#     for feature in data['features']:
#         if feature['geometry']['type'] == 'Polygon':
#             coords = feature['geometry']['coordinates'][0]
#             polygon = f"POLYGON(({','.join([f'{c[0]} {c[1]}' for c in coords])}))"
#             cur.execute(
#                 "INSERT INTO constraints (properties, geom) VALUES (%s, ST_GeomFromText(%s, 4326))",
#                 (json.dumps(feature['properties']), polygon)
#             )

# conn.commit()
# cur.close()
# conn.close()

# print("✅ GeoJSON data imported successfully!")