"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { City, ListingGeo, MapBounds, FilterState } from "@/types";

interface MapContainerProps {
  cities: City[];
  activeCityId: string | null;
  filters: FilterState;
  onBoundsChange: (bounds: MapBounds) => void;
  onMarkerClick: (listingId: string) => void;
}

/** Create a blue pill image for price markers */
function createPillImage(map: mapboxgl.Map) {
  const size = 48;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Draw a rounded rectangle pill
  const w = size;
  const h = size * 0.6;
  const r = h / 2;
  const y = (size - h) / 2;

  ctx.beginPath();
  ctx.moveTo(r, y);
  ctx.lineTo(w - r, y);
  ctx.arc(w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(r, y + h);
  ctx.arc(r, y + r, r, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();

  // Blue gradient fill
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#004AC6");
  grad.addColorStop(1, "#2563EB");
  ctx.fillStyle = grad;
  ctx.fill();

  // Shadow
  ctx.shadowColor = "rgba(0,74,198,0.3)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fill();

  // Small triangle pointer at bottom center
  ctx.shadowColor = "transparent";
  const triSize = 5;
  const cx = w / 2;
  const by = y + h;
  ctx.beginPath();
  ctx.moveTo(cx - triSize, by - 1);
  ctx.lineTo(cx, by + triSize);
  ctx.lineTo(cx + triSize, by - 1);
  ctx.closePath();
  ctx.fillStyle = "#2563EB";
  ctx.fill();

  const imgData = ctx.getImageData(0, 0, size, size);
  map.addImage("price-pill", imgData, { pixelRatio: 2 });
}

/** Create cluster background image */
function createClusterImage(map: mapboxgl.Map) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  // Outer glow
  ctx.beginPath();
  ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(37,99,235,0.15)";
  ctx.fill();

  // Main circle with gradient
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(cx, cy - r * 0.3, 0, cx, cy, r);
  grad.addColorStop(0, "#3B82F6");
  grad.addColorStop(1, "#1D4ED8");
  ctx.fillStyle = grad;
  ctx.fill();

  const imgData = ctx.getImageData(0, 0, size, size);
  map.addImage("cluster-bg", imgData, { pixelRatio: 2 });
}

export default function MapContainer({
  cities,
  activeCityId,
  filters,
  onBoundsChange,
  onMarkerClick,
}: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-0.1278, 51.5074],
      zoom: 6,
      minZoom: 5,
      maxZoom: 18,
    });

    m.addControl(new mapboxgl.NavigationControl(), "top-right");

    m.on("load", () => {
      // Generate custom marker images
      createPillImage(m);
      createClusterImage(m);

      // GeoJSON source with clustering
      m.addSource("listings", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 60,
      });

      // Cluster background
      m.addLayer({
        id: "clusters",
        type: "symbol",
        source: "listings",
        filter: ["has", "point_count"],
        layout: {
          "icon-image": "cluster-bg",
          "icon-size": [
            "interpolate", ["linear"], ["get", "point_count"],
            2, 0.8,
            20, 1.1,
            100, 1.4,
          ],
          "icon-allow-overlap": true,
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-size": 14,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      // Individual price pill markers
      m.addLayer({
        id: "unclustered-point",
        type: "symbol",
        source: "listings",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": "price-pill",
          "icon-text-fit": "both",
          "icon-text-fit-padding": [4, 8, 6, 8],
          "icon-allow-overlap": true,
          "icon-ignore-placement": false,
          "text-field": ["concat", "£", ["get", "price"]],
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-size": 12,
          "text-anchor": "center",
          "text-offset": [0, -0.1],
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      setLoaded(true);

      const initBounds = m.getBounds();
      if (initBounds) {
        onBoundsChange({
          north: initBounds.getNorth(),
          south: initBounds.getSouth(),
          east: initBounds.getEast(),
          west: initBounds.getWest(),
        });
      }
    });

    m.on("moveend", () => {
      const b = m.getBounds();
      if (!b) return;
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    });

    // Click cluster → zoom in
    m.on("click", "clusters", (e) => {
      const features = m.queryRenderedFeatures(e.point, { layers: ["clusters"] });
      if (!features.length) return;
      const clusterId = features[0].properties?.cluster_id;
      const source = m.getSource("listings") as mapboxgl.GeoJSONSource;
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || !features[0].geometry || features[0].geometry.type !== "Point") return;
        m.easeTo({
          center: features[0].geometry.coordinates as [number, number],
          zoom: zoom ?? 14,
        });
      });
    });

    // Click marker → popup (DOM API to prevent XSS)
    m.on("click", "unclustered-point", (e) => {
      if (!e.features?.length) return;
      const f = e.features[0];
      if (f.geometry.type !== "Point") return;
      const coords = f.geometry.coordinates as [number, number];
      const props = f.properties!;

      if (popup.current) popup.current.remove();

      // Build popup content safely using DOM API (no string interpolation)
      const container = document.createElement("div");
      container.style.cssText = "padding:16px;font-family:Inter,'Noto Sans SC',sans-serif";

      const priceDiv = document.createElement("div");
      priceDiv.style.cssText = "font-size:22px;font-weight:700;color:#004AC6";
      priceDiv.textContent = `£${props.price}`;
      const perMonth = document.createElement("span");
      perMonth.style.cssText = "font-size:13px;font-weight:400;color:#434655";
      perMonth.textContent = "/月";
      priceDiv.appendChild(perMonth);
      container.appendChild(priceDiv);

      const tagsDiv = document.createElement("div");
      tagsDiv.style.cssText = "display:flex;gap:6px;margin-top:6px";
      const tagStyle = "padding:2px 8px;background:#F2F4F6;border-radius:9999px;font-size:11px;color:#434655;font-weight:500";
      const roomTag = document.createElement("span");
      roomTag.style.cssText = tagStyle;
      roomTag.textContent = String(props.roomType);
      tagsDiv.appendChild(roomTag);
      const rentalTag = document.createElement("span");
      rentalTag.style.cssText = tagStyle;
      rentalTag.textContent = props.rentalType === "SHORT" ? "短租" : "长租";
      tagsDiv.appendChild(rentalTag);
      container.appendChild(tagsDiv);

      const btn = document.createElement("button");
      btn.style.cssText = "margin-top:10px;width:100%;padding:8px;border-radius:8px;background:linear-gradient(135deg,#004AC6,#2563EB);color:white;font-size:13px;font-weight:600;border:none;cursor:pointer;letter-spacing:0.5px";
      btn.textContent = "查看详情";
      btn.addEventListener("click", () => onMarkerClick(String(props.id)));
      container.appendChild(btn);

      popup.current = new mapboxgl.Popup({
        offset: 20,
        maxWidth: "280px",
        closeButton: true,
      })
        .setLngLat(coords)
        .setDOMContent(container)
        .addTo(m);
    });

    // Cursors
    m.on("mouseenter", "clusters", () => (m.getCanvas().style.cursor = "pointer"));
    m.on("mouseleave", "clusters", () => (m.getCanvas().style.cursor = ""));
    m.on("mouseenter", "unclustered-point", () => (m.getCanvas().style.cursor = "pointer"));
    m.on("mouseleave", "unclustered-point", () => (m.getCanvas().style.cursor = ""));

    map.current = m;

    return () => {
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to city
  useEffect(() => {
    if (!map.current || !loaded) return;
    if (activeCityId) {
      const city = cities.find((c) => c.id === activeCityId);
      if (city) {
        map.current.flyTo({
          center: [city.lng, city.lat],
          zoom: city.zoom,
          duration: 1500,
        });
      }
    } else {
      map.current.flyTo({
        center: [-2.0, 53.5],
        zoom: 6,
        duration: 1500,
      });
    }
  }, [activeCityId, cities, loaded]);

  // Fetch GeoJSON
  const updateMarkers = useCallback(async () => {
    if (!map.current || !loaded) return;

    const params = new URLSearchParams();
    if (filters.cityId) params.set("cityId", filters.cityId);
    if (filters.minPrice > 0) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice < 5000) params.set("maxPrice", String(filters.maxPrice));
    if (filters.roomType) params.set("roomType", filters.roomType);
    if (filters.rentalType) params.set("rentalType", filters.rentalType);

    try {
      const res = await fetch(`/api/listings/geo?${params}`);
      const json = await res.json();
      if (!json.success) return;

      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: json.data.map((item: ListingGeo) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [item.lng, item.lat] },
          properties: {
            id: item.id,
            price: item.price,
            roomType: item.roomType,
            rentalType: item.rentalType,
          },
        })),
      };

      const source = map.current!.getSource("listings") as mapboxgl.GeoJSONSource;
      if (source) source.setData(geojson);
    } catch {
      // silently fail
    }
  }, [filters, loaded]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
