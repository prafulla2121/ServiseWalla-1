import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ArrowRight } from "lucide-react";

export default function CareersPage() {
  const openPositions = [
    {
      title: "Senior Frontend Engineer",
      location: "Remote",
      department: "Engineering",
      href: "#",
    },
    {
      title: "Product Manager",
      location: "New York, NY",
      department: "Product",
      href: "#",
    },
    {
      title: "UX/UI Designer",
      location: "Remote",
      department: "Design",
      href: "#",
    },
    {
      title: "Marketing Specialist",
      location: "Chicago, IL",
      department: "Marketing",
      href: "#",
    },
  ];

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-base font-semibold uppercase tracking-wider text-primary">
            Join Our Team
          </p>
          <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight sm:text-5xl">
            Help Us Build the Future of Service
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            We're a passionate team dedicated to empowering local professionals
            and making life easier for everyone. If you're innovative,
            customer-focused, and ready to make an impact, we'd love to hear
            from you.
          </p>
        </div>

        <div className="mt-20">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-center sm:text-4xl">
                Open Positions
            </h2>
            <div className="mt-12 space-y-8 max-w-4xl mx-auto">
                {openPositions.map((position) => (
                    <Card key={position.title} className="transition-shadow hover:shadow-md">
                        <div className="grid items-center gap-6 p-6 sm:grid-cols-3">
                            <div className="sm:col-span-2">
                                <CardTitle className="font-headline text-xl">{position.title}</CardTitle>
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <MapPin className="mr-1.5 h-4 w-4"/>
                                        {position.location}
                                    </div>
                                    <p><span className="font-medium text-foreground">Department:</span> {position.department}</p>
                                </div>
                            </div>
                            <div className="sm:text-right">
                                <Button asChild>
                                    <Link href={position.href}>
                                        Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
             <div className="mt-12 text-center">
                <p className="text-muted-foreground">Don't see a role that fits? <Link href="/contact" className="font-medium text-primary hover:underline">Get in touch</Link> and tell us how you can help.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
