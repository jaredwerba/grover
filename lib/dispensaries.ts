export interface Dispensary {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  website: string;
  menu_url: string;
  hours: {
    mon_fri: string;
    sat: string;
    sun: string;
  };
  tags: Array<"recreational" | "medical">;
  description: string;
}

// Placeholder data — replace with real Cannatrail dispensaries
export const dispensaries: Dispensary[] = [
  {
    id: "green-mountain-provisions",
    name: "Green Mountain Provisions",
    address: "145 Church St",
    city: "Burlington",
    lat: 44.4759,
    lng: -73.2121,
    phone: "(802) 555-0101",
    website: "https://example.com",
    menu_url: "https://example.com/menu",
    hours: { mon_fri: "9am – 8pm", sat: "10am – 7pm", sun: "11am – 6pm" },
    tags: ["recreational", "medical"],
    description:
      "Burlington's flagship dispensary with a curated selection of Vermont-grown flower, concentrates, and edibles.",
  },
  {
    id: "capital-cannabis-co",
    name: "Capital Cannabis Co.",
    address: "22 State St",
    city: "Montpelier",
    lat: 44.2601,
    lng: -72.5754,
    phone: "(802) 555-0202",
    website: "https://example.com",
    menu_url: "https://example.com/menu",
    hours: { mon_fri: "10am – 7pm", sat: "10am – 6pm", sun: "12pm – 5pm" },
    tags: ["recreational"],
    description:
      "A welcoming shop in the heart of Vermont's capital. Knowledgeable staff and locally-sourced products.",
  },
  {
    id: "stowe-wellness",
    name: "Stowe Wellness",
    address: "64 Main St",
    city: "Stowe",
    lat: 44.4654,
    lng: -72.6874,
    phone: "(802) 555-0303",
    website: "https://example.com",
    menu_url: "https://example.com/menu",
    hours: { mon_fri: "9am – 9pm", sat: "9am – 9pm", sun: "10am – 7pm" },
    tags: ["recreational", "medical"],
    description:
      "Serving Vermont's ski country with premium flower, tinctures, and wellness-focused products.",
  },
  {
    id: "southern-vermont-cannabis",
    name: "Southern Vermont Cannabis",
    address: "18 Elliot St",
    city: "Brattleboro",
    lat: 42.8509,
    lng: -72.5579,
    phone: "(802) 555-0404",
    website: "https://example.com",
    menu_url: "https://example.com/menu",
    hours: { mon_fri: "10am – 8pm", sat: "10am – 8pm", sun: "11am – 6pm" },
    tags: ["recreational"],
    description:
      "Southern Vermont's go-to destination for quality cannabis. Wide selection across all categories.",
  },
];
