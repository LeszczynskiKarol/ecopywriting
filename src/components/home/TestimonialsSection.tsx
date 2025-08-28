// src/components/services/TestimonialsSection.tsx
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Anna Kowalska",
    company: "Tech Innovators Sp. z o.o.",
    content: "Współpraca z eCopywriting.pl to czysta przyjemność. Ich artykuły nie tylko przyciągnęły więcej ruchu na naszą stronę, ale także znacząco zwiększyły czas, jaki użytkownicy na niej spędzają. Profesjonalizm i kreatywność na najwyższym poziomie!",
    rating: 5,
    image: "/images/testimonials/anna-kowalska.jpg"
  },
  {
    name: "Jan Nowak",
    company: "Eko Solutions",
    content: "Jestem pod wrażeniem jakości artykułów dostarczanych przez eCopywriting.pl. Każdy tekst jest nie tylko świetnie napisany, ale także idealnie trafia w potrzeby naszej grupy docelowej. Zdecydowanie polecam ich usługi każdemu, kto chce podnieść jakość swojego contentu.",
    rating: 5,
    image: "/images/testimonials/jan-nowak.jpg"
  },
  {
    name: "Marta Wiśniewska",
    company: "Fashion Forward",
    content: "eCopywriting.pl potrafi doskonale uchwycić ton i styl naszej marki w każdym artykule. Ich teksty są nie tylko informative, ale także inspirujące dla naszych klientów. Współpraca z nimi to strzał w dziesiątkę dla naszego biznesu.",
    rating: 5,
    image: "/images/testimonials/marta-wisniewska.jpg"
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Co mówią o nas klienci
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center mb-4">
                <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm">{testimonial.company}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{testimonial.content}</p>
              <div className="flex">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;