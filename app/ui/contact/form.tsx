'use client'

import { useRouter } from 'next/navigation';
import Image from 'next/image'
import { Form, Input, Button, Textarea, CheckboxGroup, Checkbox } from '@heroui/react'
import { toast } from 'react-toastify';
import { useState } from 'react';

export function ContactForm() {

  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const handleServiceChange = (value: string) => {
    setSelectedServices(prev => 
      prev.includes(value) 
        ? prev.filter(service => service !== value)
        : [...prev, value]
    );
  };

  const services = [
    { id: 'personal-training', label: 'Personal Training' },
    { id: 'nutrition-coaching', label: 'Nutrition Coaching' },
    { id: 'group-classes', label: 'Group Classes' },
    { id: 'online-coaching', label: 'Online Coaching' },
    { id: 'workout-plans', label: 'Custom Workout Plans' },
    { id: 'consultation', label: 'Initial Consultation' },
  ];

  return (
    <div className="w-full">
      {/* Top header section - only visible on mobile */}
      <div className="md:hidden relative">
        <Image
          src='/home-testimonials-bg.webp'
          alt='Yellow haze'
          layout='cover'
          width={480}
          height={300}  // Reduced height
          className='w-full h-[300px] pt-6 -mb-6 object-cover opacity-50'
        />
        {/* Centered h1 over the image */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="!text-[32px] pt-4 text-center text-white z-10">Contact Us</h1>
          <p className="text-center pt-4 text-white">Any questions or remarks? Just write us a message!</p>
        </div>
      </div>

      {/* Main content grid - desktop layout */}
      <div className="grid md:grid-cols-2 w-full min-h-screen md:min-h-0">
        {/* Left side - desktop image */}
        <div className="hidden md:flex md:flex-col md:justify-center md:items-center w-full h-screen">
          <div className="w-full h-full relative flex justify-center items-center">
            <Image
              src='/home-testimonials-bg.webp'
              alt='Yellow haze'
              fill
              className='object-cover opacity-50 z-1'
            />
            {/* Desktop heading overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-grey-700 bg-opacity-30">
              <h1 className="text-4xl font-bold text-center text-white z-10">Contact Us</h1>
              <p className="text-center pt-6 text-white text-lg">Any questions or remarks? Just write us a message!</p>
            </div>
          </div>
        </div>

        {/* Right side - form */}
        <div className="relative flex flex-col items-center justify-start md:justify-center bg-transparent rounded-t-[50px] md:rounded-none md:min-h-screen">
          {/* Layer 3 */}
          <div className="absolute -top-6 left-0 right-0 bottom-0 bg-gold-300 max-w-[535px] mx-auto rounded-t-[50px] md:hidden z-1" style={{ minHeight: 'calc(100vh + 100px)' }}></div>
          {/* Layer 2 */}
          <div className="absolute -top-3 left-0 right-0 bottom-0 bg-gold-500 max-w-[525px] mx-auto rounded-t-[50px] md:hidden z-2" style={{ minHeight: 'calc(100vh + 100px)' }}></div>
          {/* Layer 1 */}
          <div className="relative w-full bg-white max-w-[515px] md:max-w-none rounded-t-[50px] md:rounded-none md:shadow-2xl z-10 min-h-full md:min-h-0">
            <Form
              className="w-full md:min-h-screen max-w-[500px] flex flex-col mx-auto gap-4 p-8 md:pt-36"
              // action={handleSubmit}
            >
              {/* First and Last Name - Side by side on large screens */}
              <div className="flex flex-col md:flex-row gap-4 w-full">
                <Input
                  isRequired
                  errorMessage="Please enter your first name"
                  name="firstName"
                  placeholder="First Name"
                  type="text"
                  variant="faded"
                  className="flex-1"
                  classNames={{
                    input: [
                      "placeholder:text-gray-700",
                      "text-grey-900",
                      "focus:rounded-[13px]",
                      "font-oxanium",
                      "pl-4",
                      "border-none",
                      "focus:border-none",
                      "outline-none",
                      "focus:outline-none",
                      "ring-0",
                      "focus:ring-0",
                    ],
                    innerWrapper: [
                      "bg-white",
                      "rounded-[13px]",
                    ],
                    inputWrapper: [
                      "shadow-xl",
                      "bg-white",
                      "!cursor-text",
                      "rounded-[13px]",
                      "border-2",
                      "border-grey-300",
                      "data-[focus=true]:border-gold-500",
                      "focus-within:border-gold-500",
                      "focus:border-gold-500",
                    ],
                  }}
                />
                
                <Input
                  isRequired
                  errorMessage="Please enter your last name"
                  name="lastName"
                  placeholder="Last Name"
                  type="text"
                  variant="faded"
                  className="flex-1"
                  classNames={{
                    input: [
                      "placeholder:text-gray-700",
                      "text-grey-900",
                      "focus:rounded-[13px]",
                      "font-oxanium",
                      "pl-4",
                      "border-none",
                      "focus:border-none",
                      "outline-none",
                      "focus:outline-none",
                      "ring-0",
                      "focus:ring-0",
                    ],
                    innerWrapper: [
                      "bg-white",
                      "rounded-[13px]",
                    ],
                    inputWrapper: [
                      "shadow-xl",
                      "bg-white",
                      "!cursor-text",
                      "rounded-[13px]",
                      "border-2",
                      "border-grey-300",
                      "data-[focus=true]:border-gold-500",
                      "focus-within:border-gold-500",
                      "focus:border-gold-500",
                    ],
                  }}
                />
              </div>

              {/* Email and Phone - Side by side on large screens */}
              <div className="flex flex-col md:flex-row gap-4 w-full">
                <Input
                  isRequired
                  errorMessage="Please enter your email address"
                  name="email"
                  placeholder="Email"
                  type="text"
                  variant="faded"
                  className="flex-1"
                  classNames={{
                    input: [
                      "placeholder:text-gray-700",
                      "text-grey-900",
                      "focus:rounded-[13px]",
                      "font-oxanium",
                      "pl-4",
                      "border-none",
                      "focus:border-none",
                      "outline-none",
                      "focus:outline-none",
                      "ring-0",
                      "focus:ring-0",
                    ],
                    innerWrapper: [
                      "bg-white",
                      "rounded-[13px]",
                    ],
                    inputWrapper: [
                      "shadow-xl",
                      "bg-white",
                      "!cursor-text",
                      "rounded-[13px]",
                      "border-2",
                      "border-grey-300",
                      "data-[focus=true]:border-gold-500",
                      "focus-within:border-gold-500",
                      "focus:border-gold-500",
                    ],
                  }}
                />
                
                <Input
                  isRequired
                  errorMessage="Please enter your phone number"
                  name="phone"
                  placeholder="Phone Number"
                  type="tel"
                  variant="faded"
                  className="flex-1"
                  classNames={{
                    input: [
                      "placeholder:text-gray-700",
                      "text-grey-900",
                      "focus:rounded-[13px]",
                      "font-oxanium",
                      "pl-4",
                      "border-none",
                      "focus:border-none",
                      "outline-none",
                      "focus:outline-none",
                      "ring-0",
                      "focus:ring-0",
                    ],
                    innerWrapper: [
                      "bg-white",
                      "rounded-[13px]",
                    ],
                    inputWrapper: [
                      "shadow-xl",
                      "bg-white",
                      "!cursor-text",
                      "rounded-[13px]",
                      "border-2",
                      "border-grey-300",
                      "data-[focus=true]:border-gold-500",
                      "focus-within:border-gold-500",
                      "focus:border-gold-500",
                    ],
                  }}
                />
              </div>
              {/* {state?.errors?.password && (
                <div>
                  <p className='text-red-500 text-left'>Password must:</p>
                  <ul>
                    {state.errors.password.map((error) => (
                      <li key={error} className='text-red-500 text-sm font-medium'>{error}</li>
                    ))}
                  </ul>
                </div>
              )} */}
              {/* Custom Checkbox Section - Card Style */}
              <div className="flex flex-col gap-3 w-full ">
                <label className="text-grey-700 font-oxanium font-medium text-sm">
                  What services are you interested in?
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {services.map((service) => (
                    <label 
                      key={service.id}
                      className={`
                        flex items-center h-[42px] gap-3 p-3 rounded-[13px] border-2 cursor-pointer transition-all duration-200
                        ${selectedServices.includes(service.id) 
                          ? 'bg-gold-50 border-gold-500' 
                          : 'bg-white border-grey-300 hover:border-grey-400'
                        }
                      `}
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="services"
                          value={service.id}
                          checked={selectedServices.includes(service.id)}
                          onChange={() => handleServiceChange(service.id)}
                          className="sr-only"
                        />
                        
                        {/* Custom checkbox */}
                        <div className={`
                          w-4 h-4 border-2 rounded-sm transition-all duration-200
                          ${selectedServices.includes(service.id) 
                            ? 'bg-gold-500 border-gold-500' 
                            : 'bg-white border-grey-300'
                          }
                          flex items-center justify-center
                        `}>
                          {selectedServices.includes(service.id) && (
                            <svg 
                              className="w-3 h-3 text-white" 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path 
                                fillRule="evenodd" 
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                clipRule="evenodd" 
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      
                      <span className="text-grey-700 font-oxanium text-sm select-none">
                        {service.label}
                      </span>
                    </label>
                  ))}
                </div>
                
                {/* Hidden input for form submission */}
                <input 
                  type="hidden" 
                  name="services" 
                  value={selectedServices.join(',')} 
                />
              </div>
              <Textarea
                isRequired
                errorMessage="Please a description of your request"
                name="description"
                placeholder="Write your Message"
                variant="faded"
                classNames={{
                  inputWrapper: [
                    "shadow-xl",
                    "bg-white",
                    "border-navy-900",
                    "backdrop-blur-xl",
                    "backdrop-saturate-200",
                    "group-data-[focus=true]:bg-white",
                    "group-data-[focus=true]:text-navy-900",
                    "dark:group-data-[focus=true]:bg-default/60",
                    "!cursor-text",
                    "rounded-[14px]",
                    "h-32",
                    "flex-col",
                    "items-stretch",
                    "border-2",
                    "border-grey-300",
                    "data-[focus=true]:border-gold-500",
                    "focus-within:border-gold-500",
                    "focus:border-gold-500",
                  ],
                  innerWrapper: [
                    "bg-white",
                    "flex-col", // Ensure it's a flex container if needed
                    "items-stretch", // Let children stretch
                  ],
                  input: [
                    "bg-white",
                    "text-grey-700",
                    "placeholder:text-grey-700",
                    "resize-y", // Allow vertical resizing
                    "font-oxanium",
                    "pl-4",
                    "border-none",           // Remove border from input element
                    "focus:border-none",     // Remove border on focus
                    "outline-none",          // Remove outline
                    "focus:outline-none",    // Remove outline on focus
                    "ring-0",                // Remove ring
                    "focus:ring-0",
                  ],
                }}
              />
              

              <Button
                type="submit"
                // disabled={pending}
                variant="solid"
                className="w-full mt-4 text-white rounded-[13px] font-outfit font-semibold text-lg"
                style={{ 
                  background: 'linear-gradient(180deg, #FFE98F 0%, #CB9F24 100%), #79DD1A' 
                }}
              >
                Submit
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}