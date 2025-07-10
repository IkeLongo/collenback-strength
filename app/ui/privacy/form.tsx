"use client";

import {Form, Input, Button, Textarea, Select, SelectItem} from "@heroui/react";
import React, { useState, useRef, FormEvent } from "react";
import {toast} from 'react-toastify';

// Define your selections array
const selections = [
  { key: 'data-access', label: 'Request Access to My Data' },
  { key: 'data-deletion', label: 'Request Deletion of My Data' },
  { key: 'data-correction', label: 'Request Correction of My Data' },
  { key: 'data-portability', label: 'Request Data Portability' },
  { key: 'opt-out', label: 'Opt-out of Data Sale/Sharing' },
  { key: 'other', label: 'Other Privacy Request' },
];

export default function PrivacyContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    requestType: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    requestType: '',
    description: ''
  });
  
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    address: false,
    requestType: false,
    description: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value) return `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        if (value.trim().length < 2) return `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        if (value.trim().length > 50) return `${name === 'firstName' ? 'First' : 'Last'} name must be less than 50 characters`;
        if (!/^[a-zA-Z\s\-']+$/.test(value.trim())) return `${name === 'firstName' ? 'First' : 'Last'} name can only contain letters, spaces, hyphens, and apostrophes`;
        return '';

      case 'email':
        if (!value) return 'Email is required';
        if (value.length > 254) return 'Email is too long';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        if (value.includes('..')) return 'Email cannot contain consecutive dots';
        if (value.startsWith('.') || value.endsWith('.')) return 'Email cannot start or end with a dot';
        return '';

      case 'address':
        if (!value) return 'Address is required';
        if (value.trim().length < 5) return 'Address must be at least 5 characters';
        if (value.trim().length > 200) return 'Address must be less than 200 characters';
        if (!/^[a-zA-Z0-9\s\-\.,#\/]+$/.test(value.trim())) return 'Address contains invalid characters';
        return '';

      case 'description':
        if (!value) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        if (value.trim().length > 5000) return 'Message must be less than 5000 characters';
        return '';

      case 'requestType':
        if (!value) return 'Request type is required';
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

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Initialize newErrors with all required properties
    const newErrors: typeof errors = {
      firstName: '',
      lastName: '',
      email: '',
      address: '',
      requestType: '',
      description: ''
    };

    // Validate all fields before submission
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      newErrors[key as keyof typeof errors] = error;
    });

    // ✅ DEBUG CODE - Add this to see what's failing
    console.log('Form Data:', formData);
    console.log('Validation Errors:', newErrors);
    console.log('Fields with errors:', Object.entries(newErrors).filter(([key, error]) => error !== ''));

    // ✅ ADD THESE LINES - Update state with errors and mark all fields as touched
    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      address: true,
      requestType: true,
      description: true
    });

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) {
      setIsSubmitting(false);
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      const response = await fetch('/api/subject-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Privacy request submitted successfully!');
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          address: '',
          requestType: '',
          description: ''
        });
        setTouched({
          firstName: false,
          lastName: false,
          email: false,
          address: false,
          requestType: false,
          description: false
        });
        setErrors({
          firstName: '',
          lastName: '',
          email: '',
          address: '',
          requestType: '',
          description: ''
        });
      } else {
        toast.error(result.message || 'Failed to submit privacy request');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      className="w-full gap-4"
      validationBehavior="native"
      onSubmit={onSubmit}
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
            // onBlur={() => handleBlur('lastName')}
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
        
        {/* Address with custom error */}
        <div className="flex flex-col gap-1 flex-1">
          <Input
            isRequired
            isInvalid={touched.address && !!errors.address}
            name="address"
            placeholder="Address"
            type="text"
            variant="faded"
            value={formData.address}
            onValueChange={(value) => handleInputChange('address', value)}
            onBlur={() => handleBlur('address')}
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
                touched.address && errors.address ? "border-red-500" : "border-grey-300",
                "data-[focus=true]:border-gold-500",
                "focus-within:border-gold-500",
                "focus:border-gold-500",
              ],
            }}
          />
          {/* Custom error message */}
          {touched.address && errors.address && (
            <span className="text-red-500 text-xs font-oxanium pl-1 animate-fadeIn">
              {errors.address}
            </span>
          )}
        </div>
      </div>

      {/* Request Type Select */}
      <div className="flex flex-col gap-1 w-full">
        <Select
          isRequired
          placeholder="Select request type"
          variant="faded"
          selectedKeys={formData.requestType ? [formData.requestType] : []}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            handleInputChange('requestType', value);
          }}
          onClose={() => handleBlur('requestType')}
          classNames={{
            base: [
              "",
            ],
            trigger: [
              "shadow-xl",
              "bg-white",
              "!cursor-pointer",
              "rounded-[13px]",
              "border-2",
              touched.requestType && errors.requestType ? "border-red-500" : "border-grey-300",
              "data-[focus=true]:border-gold-500",
              "focus-within:border-gold-500",
              "focus:border-gold-500",
              "flex",
              "pl-8",
            ],
            selectorIcon: [
              "-ml-5",
              "text-grey-700",
            ],
            value: [
              "text-grey-900",
              "font-oxanium",
            ],
          }}
          listboxProps={{
            itemClasses: {
              base: [
                "transition-opacity",
                "data-[hover=true]:text-grey-900",
                "data-[hover=true]:bg-default-100",
                "dark:data-[hover=true]:bg-default-50",
                "data-[selectable=true]:focus:bg-default-50",
                "data-[pressed=true]:opacity-70",
                "data-[focus-visible=true]:ring-default-500",
                "py-1"
              ],
            },
          }}
          popoverProps={{
            classNames: {
              base: "bg-white text-grey-500 rounded-[13px] font-oxanium border-2 border-grey-300",
              content: "",
            },
          }}
        >
          {selections.map((selection) => (
            <SelectItem key={selection.key}>
              {selection.label}
            </SelectItem>
          ))}
        </Select>
        {touched.requestType && errors.requestType && (
          <span className="text-red-500 text-xs font-oxanium pl-1 animate-fadeIn">
            {errors.requestType}
          </span>
        )}
      </div>
      
      {/* Textarea with custom error */}
      <div className="flex flex-col w-full gap-1">
        <Textarea
          isRequired
          isInvalid={touched.description && !!errors.description}
          name="description"
          placeholder="Describe your privacy request"
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
        className="w-full mt-2 text-grey-700 rounded-[13px] font-outfit !text-[16px] font-semibold text-lg cursor-pointer"
        style={{ 
          background: 'linear-gradient(180deg, #FFE98F 0%, #CB9F24 100%), #79DD1A' 
        }}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Privacy Request'}
      </Button>
    </Form>
  );
}