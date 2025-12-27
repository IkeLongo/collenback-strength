import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Validation helper functions
const validators = {
  // Email validation
  email: (email) => {
    if (!email) return "Email is required";
    if (typeof email !== 'string') return "Email must be a string";
    if (email.length > 254) return "Email is too long";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    
    // Additional checks for common email issues
    if (email.includes('..')) return "Email cannot contain consecutive dots";
    if (email.startsWith('.') || email.endsWith('.')) return "Email cannot start or end with a dot";
    
    return null; // Valid
  },

  // Name validation
  name: (name, fieldName) => {
    if (!name) return `${fieldName} is required`;
    if (typeof name !== 'string') return `${fieldName} must be a string`;
    if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
    if (name.trim().length > 50) return `${fieldName} must be less than 50 characters`;
    
    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(name.trim())) return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    
    return null; // Valid
  },

  // Phone validation
  phone: (phone) => {
    if (!phone) return "Phone number is required";
    if (typeof phone !== 'string') return "Phone must be a string";
    
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) return "Phone number must be at least 10 digits";
    if (cleanPhone.length > 15) return "Phone number must be less than 15 digits";
    
    // Check for valid phone format (allowing various formats)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(cleanPhone)) return "Please enter a valid phone number";
    
    return null; // Valid
  },

  // Description validation
  description: (description) => {
    if (!description) return "Message is required";
    if (typeof description !== 'string') return "Message must be a string";
    if (description.trim().length < 10) return "Message must be at least 10 characters";
    if (description.trim().length > 5000) return "Message must be less than 5000 characters";
    
    // Check for potential spam patterns
    const spamPatterns = [
      /(.)\1{10,}/g, // Repeated characters
      /https?:\/\/[^\s]+/gi, // URLs (you might want to allow these)
    ];
    
    for (let pattern of spamPatterns) {
      if (pattern.test(description)) {
        return "Message contains invalid content";
      }
    }
    
    return null; // Valid
  },

  // Services validation
  services: (services) => {
    if (!Array.isArray(services)) return "Services must be an array";
    
    const validServices = [
      'personal-training',
      'nutrition-coaching', 
      'group-classes',
      'online-coaching',
      'workout-plans',
      'consultation'
    ];
    
    // Check if all selected services are valid
    for (let service of services) {
      if (!validServices.includes(service)) {
        return `Invalid service: ${service}`;
      }
    }
    
    if (services.length > 6) return "Too many services selected";
    
    return null; // Valid
  }
};

// Rate limiting helper (simple in-memory store - use Redis in production)
const rateLimitStore = new Map();

const checkRateLimit = (clientIP) => {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5; // Max 5 requests per minute
  
  if (!rateLimitStore.has(clientIP)) {
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  const clientData = rateLimitStore.get(clientIP);
  
  if (now > clientData.resetTime) {
    // Reset the window
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  if (clientData.count >= maxRequests) {
    return { 
      allowed: false, 
      resetTime: clientData.resetTime,
      message: "Too many requests. Please try again later." 
    };
  }
  
  clientData.count++;
  return { allowed: true };
};

// Sanitization helper
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 5000); // Limit length
};

// Main validation function
const validateFormData = (data) => {
  const errors = {};
  
  // Validate each field
  const emailError = validators.email(data.email);
  if (emailError) errors.email = emailError;
  
  const firstNameError = validators.name(data.firstName, 'First name');
  if (firstNameError) errors.firstName = firstNameError;
  
  const lastNameError = validators.name(data.lastName, 'Last name');
  if (lastNameError) errors.lastName = lastNameError;
  
  const phoneError = validators.phone(data.phone);
  if (phoneError) errors.phone = phoneError;
  
  const descriptionError = validators.description(data.description);
  if (descriptionError) errors.description = descriptionError;
  
  const servicesError = validators.services(data.services || []);
  if (servicesError) errors.services = servicesError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Email template function
function createEmailTemplate(data) {
  const { firstName, lastName, email, phone, services, description } = data;
  
  const servicesList = services && services.length > 0 
    ? services.map(service => 
        service.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
      ).join(', ')
    : 'None selected';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Contact Form Submission</title>
    </head>
    <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #FFE98F 0%, #CB9F24 100%); padding: 30px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 24px; font-weight: bold;">
            Collenback Strength
          </h1>
          <p style="margin: 5px 0 0 0; color: white; opacity: 0.9;">
            New Contact Form Submission
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          
          <!-- Contact Info -->
          <div style="margin-bottom: 25px;">
            <h2 style="color: #333; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #CB9F24; padding-bottom: 8px;">
              Contact Information
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555; width: 80px;">Name:</td>
                <td style="padding: 8px 0; color: #333;">${firstName} ${lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #CB9F24; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Phone:</td>
                <td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #CB9F24; text-decoration: none;">${phone}</a></td>
              </tr>
            </table>
          </div>

          <!-- Services -->
          <div style="margin-bottom: 25px;">
            <h2 style="color: #333; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #CB9F24; padding-bottom: 8px;">
              Services of Interest
            </h2>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; border-left: 4px solid #CB9F24;">
              ${servicesList}
            </div>
          </div>

          <!-- Message -->
          <div style="margin-bottom: 25px;">
            <h2 style="color: #333; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #CB9F24; padding-bottom: 8px;">
              Message
            </h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; border-left: 4px solid #CB9F24; line-height: 1.6;">
              ${description.replace(/\n/g, '<br>')}
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            This email was sent from your Collenback Strength website contact form.
          </p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
            Received: ${new Date().toLocaleString()}
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}

export async function POST(request) {
  // console.log('=== Contact Form API Called ===');
  
  try {
    // Check environment configuration
    if (!process.env.RESEND_API_KEY) {
      // console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // Check rate limiting
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      // console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json(
        { success: false, message: rateLimitResult.message },
        { status: 429 }
      );
    }

    // Parse and validate request body
    let rawData;
    try {
      rawData = await request.json();
      // console.log('Raw form data received:', rawData);
    } catch (error) {
      // console.error('Invalid JSON in request body:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Sanitize input data
    const sanitizedData = {
      firstName: sanitizeInput(rawData.firstName),
      lastName: sanitizeInput(rawData.lastName),
      email: sanitizeInput(rawData.email?.toLowerCase()),
      phone: sanitizeInput(rawData.phone),
      services: Array.isArray(rawData.services) ? rawData.services : [],
      description: sanitizeInput(rawData.description)
    };

    // console.log('Sanitized form data:', sanitizedData);

    // Validate all fields
    const validation = validateFormData(sanitizedData);
    
    if (!validation.isValid) {
      // console.log('Validation errors:', validation.errors);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed', 
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    // console.log('Validation passed, sending email...');

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Collenback Strength <notifications@collenbackstrength.com>',
      to: [process.env.TO_EMAIL],
      subject: `New Contact: ${sanitizedData.firstName} ${sanitizedData.lastName}`,
      html: createEmailTemplate(sanitizedData),
    });

    if (error) {
      // console.error('Resend API error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to send email' },
        { status: 500 }
      );
    }

    // console.log('Email sent successfully:', data);
    
    // Log successful submission (you might want to save to database here)
    // console.log(`Contact form submitted by: ${sanitizedData.email} at ${new Date().toISOString()}`);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Message sent successfully',
        id: data?.id 
      },
      { status: 200 }
    );

  } catch (error) {
    // console.error('Unexpected error in contact API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
