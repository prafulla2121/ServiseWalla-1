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
  Scissors,
  Soup,
  AirVent,
  Droplets,
  Package,
  ShieldCheck,
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
    id: "ac_repair",
    name: "AC Service & Repair",
    description: "Keep cool with our expert AC maintenance and repair.",
    icon: <AirVent className="size-6" />,
  },
  {
    id: "salon_at_home",
    name: "Salon at Home",
    description: "Beauty and salon services in the comfort of your home.",
    icon: <Sparkles className="size-6" />,
  },
  {
    id: "barber_at_home",
    name: "Barber at Home",
    description: "Professional men's grooming and haircuts at home.",
    icon: <Scissors className="size-6" />,
  },
  {
    id: "painting",
    name: "Painters",
    description: "Professional interior and exterior painting.",
    icon: <Brush className="size-6" />,
  },
  {
    id: "plumbing",
    name: "Plumbers",
    description: "Reliable plumbing solutions for leaks and installations.",
    icon: <Wrench className="size-6" />,
  },
  {
    id: "electrical",
    name: "Electricians",
    description: "Certified electricians for repairs and wiring.",
    icon: <Bolt className="size-6" />,
  },
   {
    id: "cleaning",
    name: "Home Cleaning",
    description: "Impeccable home and office deep cleaning services.",
    icon: <Home className="size-6" />,
  },
  {
    id: "appliance_repair",
    name: "Appliance Repair",
    description: "Fixing refrigerators, washing machines, ovens, and more.",
    icon: <Wrench className="size-6" />,
  },
  {
    id: "ro_water_purifier",
    name: "RO Water Purifier Service",
    description: "Installation and repair for all RO water purifiers.",
    icon: <Droplets className="size-6" />,
  },
  {
    id: "handyman",
    name: "Carpenters",
    description: "General home repairs, assembly, and maintenance tasks.",
    icon: <Hammer className="size-6" />,
  },
  {
    id: "pest_control",
    name: "Pest Control",
    description: "Effective solutions for homes and businesses.",
    icon: <Bug className="size-6" />,
  },
  {
    id: "cook",
    name: "Domestic Cook",
    description: "Hire experienced cooks for daily meals at home.",
    icon: <Soup className="size-6" />,
  },
  {
    id: "moving",
    name: "Packers & Movers",
    description: "Reliable help for local and long-distance moves.",
    icon: <Truck className="size-6" />,
  },
  {
    id: "car_wash",
    name: "Car Wash & Detailing",
    description: "Mobile and on-site car cleaning and detailing.",
    icon: <Car className="size-6" />,
  },
  {
    id: "driver",
    name: "Driver on Demand",
    description: "Hire professional drivers on an hourly or daily basis.",
    icon: <Car className="size-6" />,
  },
  {
    id: "security_guard",
    name: "Security Guard",
    description: "Trained security personnel for events and properties.",
    icon: <ShieldCheck className="size-6" />,
  },
  {
    id: "tailor",
    name: "Tailoring Services",
    description: "Custom tailoring and alteration services at your doorstep.",
    icon: <Scissors className="size-6" />,
  },
  {
    id: "tutoring",
    name: "Tutoring",
    description: "Personalized academic support for all ages.",
    icon: <BookOpen className="size-6" />,
  },
  {
    id: "gardening",
    name: "Gardening",
    description: "Expert garden maintenance and landscaping.",
    icon: <Flower2 className="size-6" />,
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
    description: "Professional photographers for portraits and events.",
    icon: <Camera className="size-6" />,
  },
];
