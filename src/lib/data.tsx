import {
  Brush,
  Wrench,
  Bolt,
  Flower2,
  BookOpen,
  Dumbbell,
  Baby,
  Sparkles,
  Hammer,
  Truck,
  Bug,
  Car,
  Dog,
  CalendarDays,
  Camera,
  Code,
  Palette,
  HeartPulse,
  Music,
  Languages,
  Home,
  type LucideIcon,
} from "lucide-react";

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement<LucideIcon>;
}

export const services: Service[] = [
  {
    id: "cleaning",
    name: "Cleaning",
    description: "Impeccable home and office cleaning services.",
    icon: <Sparkles className="size-6" />,
  },
  {
    id: "plumbing",
    name: "Plumbing",
    description: "Reliable plumbing solutions for leaks and installations.",
    icon: <Wrench className="size-6" />,
  },
  {
    id: "electrical",
    name: "Electrical",
    description: "Certified electricians for repairs and wiring.",
    icon: <Bolt className="size-6" />,
  },
  {
    id: "painting",
    name: "Painting",
    description: "Professional interior and exterior painting.",
    icon: <Brush className="size-6" />,
  },
  {
    id: "gardening",
    name: "Gardening",
    description: "Expert garden maintenance and landscaping.",
    icon: <Flower2 className="size-6" />,
  },
  {
    id: "tutoring",
    name: "Tutoring",
    description: "Personalized academic support for all ages.",
    icon: <BookOpen className="size-6" />,
  },
  {
    id: "fitness",
    name: "Fitness Training",
    description: "Customized workout plans with certified trainers.",
    icon: <Dumbbell className="size-6" />,
  },
  {
    id: "childcare",
    name: "Childcare",
    description: "Trusted and caring babysitters and nannies.",
    icon: <Baby className="size-6" />,
  },
  {
    id: "handyman",
    name: "Handyman",
    description: "General home repairs, assembly, and maintenance tasks.",
    icon: <Hammer className="size-6" />,
  },
  {
    id: "appliance_repair",
    name: "Appliance Repair",
    description: "Fixing refrigerators, washing machines, ovens, and more.",
    icon: <Wrench className="size-6" />,
  },
  {
    id: "moving",
    name: "Moving Services",
    description: "Reliable help for local and long-distance moves.",
    icon: <Truck className="size-6" />,
  },
  {
    id: "pest_control",
    name: "Pest Control",
    description: "Effective solutions for homes and businesses.",
    icon: <Bug className="size-6" />,
  },
  {
    id: "car_wash",
    name: "Car Wash & Detailing",
    description: "Mobile and on-site car cleaning and detailing.",
    icon: <Car className="size-6" />,
  },
  {
    id: "pet_grooming",
    name: "Pet Grooming",
    description: "Professional grooming services for your furry friends.",
    icon: <Dog className="size-6" />,
  },
  {
    id: "event_planning",
    name: "Event Planning",
    description: "Organizing memorable parties, weddings, and corporate events.",
    icon: <CalendarDays className="size-6" />,
  },
  {
    id: "photography",
    name: "Photography",
    description: "Professional photographers for portraits, events, and commercial work.",
    icon: <Camera className="size-6" />,
  },
  {
    id: "web_development",
    name: "Web Development",
    description: "Building and maintaining websites for businesses and individuals.",
    icon: <Code className="size-6" />,
  },
  {
    id: "graphic_design",
    name: "Graphic Design",
    description: "Creating logos, branding, and marketing materials.",
    icon: <Palette className="size-6" />,
  },
  {
    id: "massage_therapy",
    name: "Massage Therapy",
    description: "Licensed therapists for relaxation and pain relief.",
    icon: <HeartPulse className="size-6" />,
  },
  {
    id: "yoga_instruction",
    name: "Yoga Instruction",
    description: "Private and group classes for all skill levels.",
    icon: <HeartPulse className="size-6" />,
  },
  {
    id: "music_lessons",
    name: "Music Lessons",
    description: "Learn to play an instrument with experienced teachers.",
    icon: <Music className="size-6" />,
  },
  {
    id: "language_lessons",
    name: "Language Lessons",
    description: "Tutoring for learning a new language.",
    icon: <Languages className="size-6" />,
  },
  {
    id: "interior_design",
    name: "Interior Design",
    description: "Reimagine your living or work space with a professional.",
    icon: <Home className="size-6" />,
  },
];
