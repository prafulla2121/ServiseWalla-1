'use server';

/**
 * @fileOverview Generates a FAQ section for the ServiceWalla website using AI.
 *
 * - generateFaq - A function that generates the FAQ content.
 * - GenerateFaqInput - The input type for the generateFaq function.
 * - GenerateFaqOutput - The return type for the generateFaq function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFaqInputSchema = z.object({
  websiteDetails: z
    .string()
    .describe('Detailed information about the ServiceWalla website, including its purpose, services offered, and target audience.'),
  routes: z
    .string()
    .describe('A list of available routes on the ServiceWalla website, such as /about, /services, /contact, etc.'),
  relatedContent: z
    .string()
    .describe('Any additional content or information that may be relevant to generating the FAQ section.'),
  userInput: z
    .string()
    .describe('The user inputted questions to generate the FAQ section.'),
});
export type GenerateFaqInput = z.infer<typeof GenerateFaqInputSchema>;

const GenerateFaqOutputSchema = z.object({
  faqContent: z
    .string()
    .describe('The generated FAQ content for the ServiceWalla website.'),
});
export type GenerateFaqOutput = z.infer<typeof GenerateFaqOutputSchema>;

export async function generateFaq(input: GenerateFaqInput): Promise<GenerateFaqOutput> {
  return generateFaqFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFaqPrompt',
  input: {schema: GenerateFaqInputSchema},
  output: {schema: GenerateFaqOutputSchema},
  prompt: `You are an AI assistant designed to generate a comprehensive and user-friendly FAQ section for the ServiceWalla website.

  Here are some details about the website:
  Website Details: {{{websiteDetails}}}
  Routes: {{{routes}}}
  Related Content: {{{relatedContent}}}
  User Input: {{{userInput}}}

  Please analyze the provided information and generate an FAQ section that addresses common questions and potential issues users may have. The FAQ section should be clear, concise, and easy to understand.
  Make sure to add route specific information.
  FAQ Content:`,
});

const generateFaqFlow = ai.defineFlow(
  {
    name: 'generateFaqFlow',
    inputSchema: GenerateFaqInputSchema,
    outputSchema: GenerateFaqOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
