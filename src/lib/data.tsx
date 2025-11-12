import {
  Brush,
  Wrench,
  Bolt,
  Flower2,
  BookOpen,
  Dumbbell,
  Baby,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { PlaceHolderImages } from "./placeholder-images";

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement<LucideIcon>;
}

export interface Worker {
  id: string;
  name: string;
  service: string;
  serviceId: string;
  rating: number;
  reviews: number;
  location: string;
  bio: string;
  skills: string[];
  avatarUrl: string;
  coverImageUrl: string;
}

export interface Testimonial {
  id: number;
  name: string;
  quote: string;
  avatarUrl: string;
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
];

export const workers: Worker[] = [
  {
    id: "1",
    name: "Alice Johnson",
    service: "Cleaning",
    serviceId: "cleaning",
    rating: 4.9,
    reviews: 124,
    location: "New York, NY",
    bio: "With over 10 years of experience, I provide top-notch, reliable cleaning services. My attention to detail is second to none, ensuring your space is spotless and fresh every time. I use eco-friendly products to keep your home safe and green.",
    skills: ["Deep Cleaning", "Residential Cleaning", "Eco-Friendly Products"],
    avatarUrl:
      PlaceHolderImages.find((img) => img.id === "worker-2")?.imageUrl || "",
    coverImageUrl:
      PlaceHolderImages.find((img) => img.id === "service-cleaning")
        ?.imageUrl || "",
  },
  {
    id: "2",
    name: "Bob Williams",
    service: "Plumbing",
    serviceId: "plumbing",
    rating: 4.8,
    reviews: 98,
    location: "Los Angeles, CA",
    bio: "Licensed plumber with a passion for solving problems. From leaky faucets to major installations, I handle every job with professionalism and efficiency. Customer satisfaction is my top priority.",
    skills: ["Pipe Repair", "Fixture Installation", "Emergency Plumbing"],
    avatarUrl:
      PlaceHolderImages.find((img) => img.id === "worker-1")?.imageUrl || "",
    coverImageUrl:
      PlaceHolderImages.find((img) => img.id === "service-plumbing")
        ?.imageUrl || "",
  },
  {
    id: "3",
    name: "Charlie Brown",
    service: "Electrical",
    serviceId: "electrical",
    rating: 4.9,
    reviews: 150,
    location: "Chicago, IL",
    bio: "Certified master electrician ready to tackle any electrical challenge. Safety and quality are my watchwords. I ensure all work is up to code and perfectly executed, giving you peace of mind.",
    skills: ["Wiring & Rewiring", "Lighting", "Panel Upgrades"],
    avatarUrl:
      PlaceHolderImages.find((img) => img.id === "worker-3")?.imageUrl || "",
    coverImageUrl:
      PlaceHolderImages.find((img) => img.id === "service-electrical")
        ?.imageUrl || "",
  },
  {
    id: "4",
    name: "Diana Miller",
    service: "Painting",
    serviceId: "painting",
    rating: 4.7,
    reviews: 85,
    location: "Houston, TX",
    bio: "Transforming spaces with color is my specialty. I am a meticulous painter who takes pride in delivering a flawless finish, whether it's a single room or an entire house exterior.",
    skills: ["Interior Painting", "Exterior Painting", "Color Consultation"],
    avatarUrl:
      PlaceHolderImages.find((img) => img.id === "worker-4")?.imageUrl || "",
    coverImageUrl:
      PlaceHolderImages.find((img) => img.id === "service-painting")
        ?.imageUrl || "",
  },
  {
    id: "5",
    name: "Ethan Davis",
    service: "Gardening",
    serviceId: "gardening",
    rating: 5.0,
    reviews: 210,
    location: "Phoenix, AZ",
    bio: "Green-thumbed gardener with a love for creating beautiful, sustainable outdoor spaces. From lawn care to landscape design, I help your garden thrive in every season.",
    skills: ["Landscape Design", "Lawn Maintenance", "Planting"],
    avatarUrl:
      PlaceHolderImages.find((img) => img.id === "worker-5")?.imageUrl || "",
    coverImageUrl:
      PlaceHolderImages.find((img) => img.id === "service-gardening")
        ?.imageUrl || "",
  },
  {
    id: "6",
    name: "Fiona Garcia",
    service: "Tutoring",
    serviceId: "tutoring",
    rating: 4.9,
    reviews: 77,
    location: "Philadelphia, PA",
    bio: "Patient and experienced educator specializing in math and science. I create personalized learning plans to help students build confidence and achieve their academic goals. I make learning fun and effective.",
    skills: ["Mathematics", "Physics", "Test Prep"],
    avatarUrl:
      PlaceHolderImages.find((img) => img.id === "worker-6")?.imageUrl || "",
    coverImageUrl:
      PlaceHolderImages.find((img) => img.id === "service-tutoring")
        ?.imageUrl || "",
  },
  {
    id: "7",
    name: "George Rodriguez",
    service: "Fitness Training",
    serviceId: "fitness",
    rating: 4.8,
    reviews: 130,
    location: "San Diego, CA",
    bio: "Certified personal trainer dedicated to helping you reach your fitness potential. I specialize in strength training and functional fitness, creating workouts that are both challenging and enjoyable.",
    skills: ["Strength Training", "Weight Loss", "Functional Fitness"],
    avatarUrl:
      PlaceHolderImages.find((img) => img.id === "worker-7")?.imageUrl || "",
    coverImageUrl:
      PlaceHolderImages.find((img) => img.id === "service-fitness")
        ?.imageUrl || "",
  },
  {
    id: "8",
    name: "Hannah Martinez",
    service: "Childcare",
    serviceId: "childcare",
    rating: 5.0,
    reviews: 95,
    location: "Dallas, TX",
    bio: "Caring and certified childcare provider with a background in early childhood education. I provide a safe, fun, and nurturing environment for children to learn and grow.",
    skills: ["Early Childhood Education", "First Aid/CPR", "Creative Play"],
    avatarUrl:
      PlaceHolderImages.find((img) => img.id === "worker-8")?.imageUrl || "",
    coverImageUrl:
      PlaceHolderImages.find((img) => img.id === "service-childcare")
        ?.imageUrl || "",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah L.",
    quote:
      "Booking a cleaner through ServiceWalla was so easy! Alice was professional, thorough, and my apartment has never looked better. Highly recommend!",
    avatarUrl:
      PlaceHolderImages.find((img) => img.id === "testimonial-1")?.imageUrl ||
      "",
  },
  {
    id: 2,
    name: "Mike P.",
    quote:
      "I had a plumbing emergency and Bob from ServiceWalla was at my door within an hour. He fixed the issue quickly and was very transparent about the cost. A lifesaver!",
    avatarUrl:
      PlaceHolderImages.find((img) => img.id === "testimonial-2")?.imageUrl ||
      "",
  },
  {
    id: 3,
    name: "Jennifer C.",
    quote:
      "Fiona has been tutoring my son for six months and the improvement in his grades is incredible. She's patient, knowledgeable, and makes learning fun.",
    avatarUrl:
      PlaceHolderImages.find((img) => img.id === "testimonial-3")?.imageUrl ||
      "",
  },
  {
    id: 4,
    name: "David R.",
    quote:
      "The platform is user-friendly and I love that I can see ratings and reviews before booking. I've used it for multiple services and have always been impressed.",
    avatarUrl:
      PlaceHolderImages.find((img) => img.id === "testimonial-4")?.imageUrl ||
      "",
  },
];