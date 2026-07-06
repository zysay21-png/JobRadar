import { displayCountry } from "./countries";

const PLACEHOLDER_SEGMENT = /^blank$/i;
const MULTIPLE_LOCATIONS = /^multiple locations$/i;

// Some sources (Epic Games' Greenhouse board) store a compound
// "city,state,country" string with no space after the commas — sometimes
// with a literal "BLANK" placeholder for a missing city/state, or
// "Multiple Locations" as the country when a role spans many offices
// (e.g. "BLANK,BLANK,Multiple Locations", "Shanghai,BLANK,China"). This is
// detected by the lack of a space after a comma: every genuine single
// office name or "City, Region" value elsewhere (Rockstar, Zynga, Sony,
// ...) always has a space after its comma.
const COMPOUND_NO_SPACE_COMMA = /,\S/;

function cleanCityField(city: string | null | undefined): string | null {
  const trimmed = city?.trim();
  if (!trimmed) return null;

  if (!COMPOUND_NO_SPACE_COMMA.test(trimmed)) {
    return trimmed;
  }

  const segments = trimmed
    .split(",")
    .map((segment) => segment.trim())
    .filter((segment) => segment && !PLACEHOLDER_SEGMENT.test(segment));

  if (segments.length === 0) return null;
  return segments.join(", ");
}

// Formats a city/country pair for display, never returning a placeholder
// like "Location not specified", "BLANK", or a malformed joined string.
// Returns null when there's nothing usable to show — callers should hide
// the location row entirely in that case rather than show fallback text.
export function formatLocation(
  city: string | null | undefined,
  country: string | null | undefined
): string | null {
  const cleanedCity = cleanCityField(city);
  const cleanedCountry = displayCountry(country ?? null);

  // The source's own "Multiple Locations" placeholder is the complete,
  // exact answer — shown verbatim, not appended to.
  if (cleanedCity && MULTIPLE_LOCATIONS.test(cleanedCity)) {
    return "Multiple Locations";
  }

  const parts = [cleanedCity, cleanedCountry].filter((part): part is string => Boolean(part));
  if (parts.length === 0) return null;
  return parts.join(", ");
}
