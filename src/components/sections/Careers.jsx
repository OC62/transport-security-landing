// src/components/sections/Careers.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
// Импортируем новый компонент GlassmorphicButton
import { GlassmorphicButton } from '../ui/GlassmorphicButton';

export const Careers = () => {
  const [openJobId, setOpenJobId] = useState(null);

  // Функция для плавной прокрутки к секции контактов
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleJob = (id) => {
    setOpenJobId(openJobId === id ? null : id);
  };

  const jobs = [
    {
      id: 1,
      title: "Специалист по транспортной безопасности",
      department: "ГБР, ТСО, Наблюдение и собеседование",
      location: "Ростов-на-Дону",
      type: "Полная занятость",
      description: "Недопущение актов незаконного вмешательства на объектах транспортной инфраструктуры",
      requirements: [
        "Опыт работы - не требуется",
        "Наличие свидетельства об аттестации в качестве специалиста по транспортной безопасности (не обязательно)",
      ],
      responsibilities: [
        "Работа на объектах транспортной инфраструктуры",
        "Недопущение АНВ",
      ]
    },
    {
      id: 2,
      title: "Специалист по транспортной безопасности",
      department: "ГБР, ТСО, Наблюдение и собеседование",
      location: "Волгоград",
      type: "Полная занятость",
      description: "Недопущение актов незаконного вмешательства на объектах транспортной инфраструктуры",
      requirements: [
        "Опыт работы - не требуется",
        "Наличие свидетельства об аттестации в качестве специалиста по транспортной безопасности (не обязательно)",
      ],
      responsibilities: [
        "Работа на объектах транспортной инфраструктуры",
        "Недопущение АНВ",
      ]
    },
    {
      id: 3,
      title: "Специалист по транспортной безопасности",
      department: "ГБР, ТСО, Наблюдение и собеседование",
      location: "Уфа",
      type: "Полная занятость",
      description: "Недопущение актов незаконного вмешательства на объектах транспортной инфраструктуры",
      requirements: [
        "Опыт работы - не требуется",
        "Наличие свидетельства об аттестации в качестве специалиста по транспортной безопасности (не обязательно)",
      ],
      responsibilities: [
        "Работа на объектах транспортной инфраструктуры",
        "Недопущение АНВ",
      ]
    },
    {
      id: 4,
      title: "Специалист по транспортной безопасности",
      department: "ГБР, ТСО, Наблюдение и собеседование",
      location: "Казань",
      type: "Полная занятость",
      description: "Недопущение актов незаконного вмешательства на объектах транспортной инфраструктуры",
      requirements: [
        "Опыт работы - не требуется",
        "Наличие свидетельства об аттестации в качестве специалиста по транспортной безопасности (не обязательно)",
      ],
      responsibilities: [
        "Работа на объектах транспортной инфраструктуры",
        "Недопущение АНВ",
      ]
    }
  ];

  return (
    <section className="py-20 bg-white" id="careers">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Наши вакансии
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Присоединяйтесь к команде профессионалов в сфере транспортной безопасности
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              className="mb-6 border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                className="w-full p-6 text-left bg-white hover:bg-gray-50 transition-colors flex justify-between items-center"
                onClick={() => toggleJob(job.id)}
                aria-expanded={openJobId === job.id}
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {job.department}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      {job.location}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                      {job.type}
                    </span>
                  </div>
                </div>
                <div className="text-gray-500">
                  {openJobId === job.id ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </button>
              
              {openJobId === job.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 border-t border-gray-100"
                >
                  <p className="text-gray-600 my-4">{job.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Обязанности:</h4>
                      <ul className="space-y-2">
                        {job.responsibilities.map((resp, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                            <span className="text-gray-600">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Требования:</h4>
                      <ul className="space-y-2">
                        {job.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                            <span className="text-gray-600">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    {/* Заменено GlassButton на GlassmorphicButton */}
                    <GlassmorphicButton 
                      variant="onWhite"
                      size="large"
                      onClick={scrollToContact}
                    >
                      Откликнуться на вакансию
                    </GlassmorphicButton>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mt-16 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Не нашли подходящую вакансию?
          </h3>
          <p className="text-gray-600 mb-6">
            Присылайте ваше резюме, мы свяжемся с вами при появлении подходящих предложений
          </p>
          {/* Заменено GlassButton на GlassmorphicButton */}
          <GlassmorphicButton 
            variant="onWhite"
            size="large"
            onClick={scrollToContact}
          >
            Отправить резюме
          </GlassmorphicButton>
        </motion.div>
      </div>
    </section>
  );
};