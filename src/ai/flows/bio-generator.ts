'use server';
/**
 * @fileOverview Generates a professional bio for a service worker.
 *
 * - generateBio - A function that generates a bio.
 * - GenerateBioInput - The input type for the generateBio function.
 * - GenerateBioOutput - The return type for the generateBio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBioInputSchema = z.object({
  profession: z.string().describe('The profession of the service worker (e.g., Plumber, Cleaner).'),
  keywords: z.string().describe('A comma-separated list of keywords, skills, or attributes about the worker.'),
});
export type GenerateBioInput = z.infer<typeof GenerateBioInputSchema>;

const GenerateBioOutputSchema = z.object({
  bio: z.string().describe('The generated professional bio, around 2-3 sentences long.'),
});
export type GenerateBioOutput = z.infer<typeof GenerateBioOutputSchema>;

export async function generateBio(input: GenerateBioInput): Promise<GenerateBioOutput> {
  return generateBioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBioPrompt',
  input: {schema: GenerateBioInputSchema},
  output: {schema: GenerateBioOutputSchema},
  prompt: `You are an expert copywriter. Your task is to write a short, professional, and friendly bio for a service worker.

The bio should be about 2-3 sentences long. It should be written in the first person (e.g., "I am a...").

Use the following information to create the bio:
Profession: {{{profession}}}
Key attributes/skills: {{{keywords}}}

Generate a compelling bio that would make a customer feel confident in hiring this person.`,
});

const generateBioFlow = ai.defineFlow(
  {
    name: 'generateBioFlow',
    inputSchema: GenerateBioInputSchema,
    outputSchema: GenerateBioOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
