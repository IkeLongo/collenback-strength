'use client'

import { useSearchParams } from 'next/navigation';
import Image from 'next/image'
import { Form, Input, Button, Textarea } from '@heroui/react'
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

export function ContactForm() {
  const searchParams = useSearchParams();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Map URL parameter values to your service IDs
  const serviceMapping: { [key: string]: string } = {
    'personal-training': 'personal-training',
    'strength-programs': 'strength-programs',
    'online-training': 'online-coaching',
    'nutritional-guidance': 'nutrition-coaching',
    'group-classes': 'group-classes',
    'workout-plans': 'workout-plans',
  };

  // Pre-select service from URL parameters on component mount
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam && serviceMapping[serviceParam]) {
      setSelectedServices([serviceMapping[serviceParam]]);
    }
  }, [searchParams]);
  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    description: ''
  });

  // Validation errors state
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    description: ''
  });

  // Touched fields state (to only show errors after user interaction)
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    description: false
  });

  // Validation functions
  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) return `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        if (value.trim().length < 2) return `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        if (value.trim().length > 50) return `${name === 'firstName' ? 'First' : 'Last'} name must be less than 50 characters`;
        if (!/^[a-zA-Z\s\-']+$/.test(value.trim())) return `${name === 'firstName' ? 'First' : 'Last'} name can only contain letters, spaces, hyphens, and apostrophes`;
        return '';

      case 'email':
        if (!value) return 'Email is required';
        if (value.length > 254) return 'Email is too long';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        if (value.includes('..')) return 'Email cannot contain consecutive dots';
        if (value.startsWith('.') || value.endsWith('.')) return 'Email cannot start or end with a dot';
        return '';

      case 'phone':
        if (!value) return 'Phone number is required';
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length < 10) return 'Phone number must be at least 10 digits';
        if (cleanPhone.length > 15) return 'Phone number must be less than 15 digits';
        return '';

      case 'description':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        if (value.trim().length > 5000) return 'Message must be less than 5000 characters';
        return '';

      default:
        return '';
    }
  };

  // Handle input changes with real-time validation
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Only validate if the field has been touched
    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Handle field blur (when user leaves the field)
  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof typeof formData]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle service selection
  const handleServiceChange = (value: string) => {
    setSelectedServices(prev => 
      prev.includes(value) 
        ? prev.filter(service => service !== value)
        : [...prev, value]
    );
  };

  const services = [
    { id: 'personal-training', label: 'Personal Training' },
    { id: 'strength-programs', label: 'Strength Programs' },
    { id: 'online-coaching', label: 'Online Coaching' },
    { id: 'nutrition-coaching', label: 'Nutrition Coaching' },
    { id: 'group-classes', label: 'Group Classes' },
    { id: 'workout-plans', label: 'Custom Workout Plans' },
  ];

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    // Validate all fields before submission
    const newErrors = {
      firstName: validateField('firstName', formData.get('firstName') as string),
      lastName: validateField('lastName', formData.get('lastName') as string),
      email: validateField('email', formData.get('email') as string),
      phone: validateField('phone', formData.get('phone') as string),
      description: validateField('description', formData.get('description') as string),
    };

    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      description: true
    });

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) {
      toast.error('Please fix all validation errors before submitting');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const data = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        services: selectedServices,
        description: formData.get('description') as string,
      };

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      
      if (result.success) {
        toast.success("Message sent successfully!");
        // Reset form
        setSelectedServices([]);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          description: ''
        });
        setErrors({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          description: ''
        });
        setTouched({
          firstName: false,
          lastName: false,
          email: false,
          phone: false,
          description: false
        });
      } else {
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, error]) => {
            toast.error(`${field}: ${error}`);
          });
        } else {
          toast.error(result.message || "Something went wrong. Please try again.");
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Top header section - only visible on mobile */}
      <div className="md:hidden relative">
        <Image
          src='/home-testimonials-bg.webp'
          alt='Yellow haze'
          layout='cover'
          width={480}
          height={300}
          className='w-full h-[300px] pt-6 -mb-6 object-cover opacity-50'
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="!text-[32px] pt-4 text-center text-white z-10">Contact Us</h1>
          <p className="text-center pt-4 text-white z-10">Any questions or remarks? Just write us a message!</p>
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
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-grey-700 bg-opacity-30">
              <h1 className="text-4xl font-bold text-center text-white z-10">Contact Us</h1>
              <p className="text-center pt-6 text-white text-lg z-10">Any questions or remarks? Just write us a message!</p>
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
              className="w-full items-center justify-center md:min-h-screen max-w-[600px] flex flex-col mx-auto gap-4 p-8 md:pt-36"
              action={handleSubmit}
            >
              {/* First and Last Name - Side by side on large screens */}
              <div className="flex flex-col md:flex-row gap-4 w-full">
                {/* First Name with custom error */}
                <div className="flex flex-col gap-1 flex-1">
                  <Input
                    isRequired
                    isInvalid={touched.firstName && !!errors.firstName}
                    name="firstName"
                    placeholder="First Name"
                    type="text"
                    variant="faded"
                    value={formData.firstName}
                    onValueChange={(value) => handleInputChange('firstName', value)}
                    onBlur={() => handleBlur('firstName')}
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
                        "text-[18px]",
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
                        touched.firstName && errors.firstName ? "border-red-500" : "border-grey-300",
                        "data-[focus=true]:border-gold-500",
                        "focus-within:border-gold-500",
                        "focus:border-gold-500",
                      ],
                    }}
                  />
                  {/* Custom error message */}
                  {touched.firstName && errors.firstName && (
                    <span className="text-red-500 text-xs font-oxanium pl-1 animate-fadeIn">
                      {errors.firstName}
                    </span>
                  )}
                </div>
                
                {/* Last Name with custom error */}
                <div className="flex flex-col gap-1 flex-1">
                  <Input
                    isRequired
                    isInvalid={touched.lastName && !!errors.lastName}
                    name="lastName"
                    placeholder="Last Name"
                    type="text"
                    variant="faded"
                    value={formData.lastName}
                    onValueChange={(value) => handleInputChange('lastName', value)}
                    onBlur={() => handleBlur('lastName')}
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
                        "text-[18px]",
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
                        touched.lastName && errors.lastName ? "border-red-500" : "border-grey-300",
                        "data-[focus=true]:border-gold-500",
                        "focus-within:border-gold-500",
                        "focus:border-gold-500",
                      ],
                    }}
                  />
                  {/* Custom error message */}
                  {touched.lastName && errors.lastName && (
                    <span className="text-red-500 text-xs font-oxanium pl-1 animate-fadeIn">
                      {errors.lastName}
                    </span>
                  )}
                </div>
              </div>

              {/* Email and Phone - Side by side on large screens */}
              <div className="flex flex-col md:flex-row gap-4 w-full">
                {/* Email with custom error */}
                <div className="flex flex-col gap-1 flex-1">
                  <Input
                    isRequired
                    isInvalid={touched.email && !!errors.email}
                    name="email"
                    placeholder="Email"
                    type="email"
                    variant="faded"
                    value={formData.email}
                    onValueChange={(value) => handleInputChange('email', value)}
                    onBlur={() => handleBlur('email')}
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
                        "text-[18px]",
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
                        touched.email && errors.email ? "border-red-500" : "border-grey-300",
                        "data-[focus=true]:border-gold-500",
                        "focus-within:border-gold-500",
                        "focus:border-gold-500",
                      ],
                    }}
                  />
                  {/* Custom error message */}
                  {touched.email && errors.email && (
                    <span className="text-red-500 text-xs font-oxanium pl-1 animate-fadeIn">
                      {errors.email}
                    </span>
                  )}
                </div>
                
                {/* Phone with custom error */}
                <div className="flex flex-col gap-1 flex-1">
                  <Input
                    isRequired
                    isInvalid={touched.phone && !!errors.phone}
                    name="phone"
                    placeholder="Phone Number"
                    type="tel"
                    variant="faded"
                    value={formData.phone}
                    onValueChange={(value) => handleInputChange('phone', value)}
                    onBlur={() => handleBlur('phone')}
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
                        "text-[18px]",
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
                        touched.phone && errors.phone ? "border-red-500" : "border-grey-300",
                        "data-[focus=true]:border-gold-500",
                        "focus-within:border-gold-500",
                        "focus:border-gold-500",
                      ],
                    }}
                  />
                  {/* Custom error message */}
                  {touched.phone && errors.phone && (
                    <span className="text-red-500 text-xs font-oxanium pl-1 animate-fadeIn">
                      {errors.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Custom Checkbox Section - Card Style */}
              <div className="flex flex-col gap-3 w-full ">
                <label className="text-grey-700 font-oxanium font-medium !text-[18px] pt-2">
                  What services are you interested in?
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {services.map((service) => (
                    <label 
                      key={service.id}
                      className={`
                        flex items-center h-auto gap-3 p-3 rounded-[13px] border-2 cursor-pointer transition-all duration-200
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
                      
                      <span className="text-grey-700 font-oxanium !text-[18px] select-none">
                        {service.label}
                      </span>
                    </label>
                  ))}
                </div>
                
                <input 
                  type="hidden" 
                  name="services" 
                  value={selectedServices.join(',')} 
                />
              </div>

              {/* Textarea with custom error */}
              <div className="flex flex-col w-full gap-1">
                <Textarea
                  isRequired
                  isInvalid={touched.description && !!errors.description}
                  name="description"
                  placeholder="Write your Message"
                  variant="faded"
                  value={formData.description}
                  onValueChange={(value) => handleInputChange('description', value)}
                  onBlur={() => handleBlur('description')}
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
                      touched.description && errors.description ? "border-red-500" : "border-grey-300",
                      "data-[focus=true]:border-gold-500",
                      "focus-within:border-gold-500",
                      "focus:border-gold-500",
                    ],
                    innerWrapper: [
                      "bg-white",
                      "flex-col",
                      "items-stretch",
                    ],
                    input: [
                      "bg-white",
                      "text-grey-700",
                      "placeholder:text-grey-700",
                      "resize-y",
                      "font-oxanium",
                      "pl-4",
                      "border-none",
                      "focus:border-none",
                      "outline-none",
                      "focus:outline-none",
                      "ring-0",
                      "focus:ring-0",
                      "text-[18px]",
                    ],
                  }}
                />
                {/* Custom error message */}
                {touched.description && errors.description && (
                  <span className="text-red-500 text-xs font-oxanium pl-1 animate-fadeIn">
                    {errors.description}
                  </span>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                variant="solid"
                className="w-full mt-4 text-grey-700 rounded-[13px] font-outfit font-semibold text-lg cursor-pointer"
                style={{ 
                  background: 'linear-gradient(180deg, #FFE98F 0%, #CB9F24 100%), #79DD1A' 
                }}
              >
                {isSubmitting ? 'Sending...' : 'Submit'}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}