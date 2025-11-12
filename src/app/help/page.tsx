import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FaqGenerator } from "@/components/FaqGenerator";

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I book a service?",
      answer:
        "You can book a service by navigating to the 'Services' page, selecting the service you need, choosing a professional from the list, and then clicking the 'Book Now' button on their profile. This will take you to a booking form where you can select a date and time.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept all major credit cards, including Visa, Mastercard, and American Express. All payments are processed securely through our platform after the service is completed.",
    },
    {
      question: "Can I cancel or reschedule a booking?",
      answer:
        "Yes, you can cancel or reschedule a booking up to 24 hours before the scheduled service time without any charge. To do so, go to your account dashboard and find your upcoming bookings. Cancellations made within 24 hours of the service may be subject to a fee.",
    },
    {
      question: "How are the professionals vetted?",
      answer:
        "We take your safety and satisfaction seriously. All professionals on ServiceWalla go through a rigorous vetting process, including background checks, reference checks, and verification of licenses and certifications where applicable.",
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer:
        "Your satisfaction is our priority. If you're not happy with the service provided, please contact our support team through the 'Contact Us' page within 48 hours. We will work with you and the professional to resolve the issue.",
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 sm:py-24">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight sm:text-5xl">
          Help Center
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Find answers to common questions or ask our AI for help.
        </p>
      </div>

      <div className="mt-16 space-y-16">
        <section>
          <h2 className="mb-8 text-center font-headline text-3xl font-bold">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section>
          <FaqGenerator />
        </section>
      </div>
    </div>
  );
}
