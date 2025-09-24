import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, Clock, Send, HelpCircle, FileText, CreditCard, Plane } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Support: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'contact' | 'faq' | 'chat'>('contact');
  const [contactForm, setContactForm] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    subject: '',
    category: '',
    message: '',
  });
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'support', message: 'Hello! How can I help you today?', time: new Date() }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save to localStorage for demo
      const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
      const newTicket = {
        id: Date.now().toString(),
        ...contactForm,
        status: 'open',
        createdAt: new Date().toISOString(),
        userId: user?.id || null,
      };
      tickets.push(newTicket);
      localStorage.setItem('supportTickets', JSON.stringify(tickets));

      alert('Your support ticket has been submitted successfully! We will get back to you within 24 hours.');
      setContactForm({
        name: user ? `${user.firstName} ${user.lastName}` : '',
        email: user?.email || '',
        subject: '',
        category: '',
        message: '',
      });
    } catch (error) {
      alert('Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      id: chatMessages.length + 1,
      sender: 'user',
      message: newMessage,
      time: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: chatMessages.length + 2,
        sender: 'support',
        message: getBotResponse(newMessage),
        time: new Date(),
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('booking') || lowerMessage.includes('reservation')) {
      return 'For booking-related queries, you can check your reservations in the "My Bookings" section. If you need to modify or cancel a booking, please provide your PNR number.';
    } else if (lowerMessage.includes('refund') || lowerMessage.includes('cancel')) {
      return 'Refund requests are processed within 7-10 business days. Cancellation fees may apply depending on your ticket type. Would you like me to connect you with our refund specialist?';
    } else if (lowerMessage.includes('check-in') || lowerMessage.includes('boarding')) {
      return 'Online check-in opens 24 hours before departure. You can check-in using your PNR or email address in our Check-in section.';
    } else if (lowerMessage.includes('baggage') || lowerMessage.includes('luggage')) {
      return 'Standard baggage allowance is 23kg for checked bags and 7kg for carry-on. Additional baggage can be purchased online or at the airport.';
    } else {
      return 'Thank you for your message. Our support team will assist you shortly. For immediate assistance, please call our 24/7 helpline at +1-800-FLY-INTL.';
    }
  };

  const faqData = [
    {
      category: 'Booking & Reservations',
      icon: <Plane className="h-5 w-5" />,
      questions: [
        {
          q: 'How can I book a flight?',
          a: 'You can book flights through our website by searching for your desired route, selecting flights, and completing the booking process with passenger details and payment.'
        },
        {
          q: 'Can I modify my booking?',
          a: 'Yes, you can modify your booking up to 24 hours before departure. Changes may incur additional fees depending on your ticket type.'
        },
        {
          q: 'How do I cancel my booking?',
          a: 'You can cancel your booking through "My Bookings" section or by contacting our customer service. Cancellation fees may apply.'
        }
      ]
    },
    {
      category: 'Check-in & Boarding',
      icon: <FileText className="h-5 w-5" />,
      questions: [
        {
          q: 'When can I check-in online?',
          a: 'Online check-in opens 24 hours before departure and closes 2 hours before for international flights.'
        },
        {
          q: 'What documents do I need for check-in?',
          a: 'You need a valid passport for international flights and a government-issued ID for domestic flights.'
        },
        {
          q: 'Can I select my seat during check-in?',
          a: 'Yes, you can select available seats during online check-in. Premium seats may incur additional charges.'
        }
      ]
    },
    {
      category: 'Payment & Refunds',
      icon: <CreditCard className="h-5 w-5" />,
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept major credit cards, debit cards, and PayPal. All transactions are secured with SSL encryption.'
        },
        {
          q: 'How long do refunds take?',
          a: 'Refunds are processed within 7-10 business days to your original payment method.'
        },
        {
          q: 'Are there any booking fees?',
          a: 'We charge a small service fee for bookings, which is clearly displayed before payment confirmation.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Support</h1>
          <p className="text-gray-600">We're here to help you 24/7</p>
        </div>

        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Call Us</h3>
            <p className="text-gray-600 mb-2">24/7 Customer Service</p>
            <p className="text-primary-600 font-medium">+1-800-FLY-INTL</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Email Us</h3>
            <p className="text-gray-600 mb-2">Response within 24 hours</p>
            <p className="text-green-600 font-medium">support@internationalairlines.com</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Business Hours</h3>
            <p className="text-gray-600 mb-2">Customer Service</p>
            <p className="text-blue-600 font-medium">24/7 Available</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'contact'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Contact Form
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'faq'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                FAQ
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'chat'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Live Chat
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Contact Form Tab */}
            {activeTab === 'contact' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={contactForm.category}
                        onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select a category</option>
                        <option value="booking">Booking & Reservations</option>
                        <option value="checkin">Check-in & Boarding</option>
                        <option value="baggage">Baggage</option>
                        <option value="refund">Refunds & Cancellations</option>
                        <option value="special">Special Assistance</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Brief description of your issue"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      required
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Please provide detailed information about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {faqData.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold flex items-center">
                          {category.icon}
                          <span className="ml-2">{category.category}</span>
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {category.questions.map((faq, faqIndex) => (
                          <details key={faqIndex} className="group">
                            <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between">
                              <span className="font-medium text-gray-900">{faq.q}</span>
                              <HelpCircle className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                            </summary>
                            <div className="px-6 pb-4 text-gray-600">
                              {faq.a}
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Chat Tab */}
            {activeTab === 'chat' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Live Chat Support</h2>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="h-96 overflow-y-auto p-4 bg-gray-50">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender === 'user'
                              ? 'bg-primary-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                          }`}>
                            {msg.time.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="submit"
                        className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;