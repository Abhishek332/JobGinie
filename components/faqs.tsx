import SectionHeader from './section-header';
import SectionWrapper from './section-wrapper';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { faqs } from '@/data/faqs';

function FAQs() {
  return (
    <SectionWrapper>
      <SectionHeader title="Frequently Asked Questions" />
      <Accordion
        type="single"
        collapsible
        className="w-full"
      >
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
          >
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionWrapper>
  );
}

export default FAQs;
