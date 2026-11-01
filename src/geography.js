// Coordinates in metres: west is +X, north is +Z. No route smoothing or rescaling.
export function nearestOnLine(points, x, z) {
  let best = { distance: Infinity, s: 0, x: 0, z: 0, heading: 0, index: 0 }, travelled = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i], [bx, bz] = points[i + 1];
    const dx = bx - ax, dz = bz - az, len = Math.hypot(dx, dz);
    if (!len) continue;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len ** 2));
    const px = ax + t * dx, pz = az + t * dz, distance = Math.hypot(x - px, z - pz);
    if (distance < best.distance) best = { distance, s: travelled + t * len, x: px, z: pz, heading: Math.atan2(dx, dz), index: i };
    travelled += len;
  }
  return best;
}
export function pointAt(points, s) {
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i], [bx, bz] = points[i + 1], len = Math.hypot(bx - ax, bz - az);
    if (s <= len || i === points.length - 2) {
      const t = Math.max(0, Math.min(1, s / len));
      return { x: ax + (bx - ax) * t, z: az + (bz - az) * t, heading: Math.atan2(bx - ax, bz - az) };
    }
    s -= len;
  }
}
export function insidePolygon(points, x, z) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [ax, az] = points[i], [bx, bz] = points[j];
    if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) inside = !inside;
  }
  return inside;
}
export function geographicPosition(origin, x, z) {
  const scale = 111319.49079327358;
  return { lat: origin[1] + z / scale, lon: origin[0] - x / (scale * Math.cos(origin[1] * Math.PI / 180)) };
}
