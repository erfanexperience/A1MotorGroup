import React, { useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: Implement backend submission
  };

  return (
    <>
      <Header />
      <ContactPageOuter>
        <ContactCard>
          <ContactInfoCol>
            <ContactTitle>Contact Us</ContactTitle>
            <ContactInfoItem>
              <b>Address:</b> 345 Saratoga Ave, San Jose, CA 95129
            </ContactInfoItem>
            <ContactInfoItem>
              <b>Phone:</b> <a href="tel:+14089825456">(408) 982-5456</a>
            </ContactInfoItem>
            <ContactInfoItem>
              <b>Email:</b> <a href="mailto:enquiry@a1motorgroup.com">enquiry@a1motorgroup.com</a>
            </ContactInfoItem>
            <ContactInfoItem>
              <b>Hours:</b> Mon - Saturday 10AM - 5PM
            </ContactInfoItem>
          </ContactInfoCol>
          <ContactFormCol>
            <ContactFormTitle>Send Us a Message</ContactFormTitle>
            {submitted ? (
              <ContactSuccess>Thank you! We'll get back to you soon.</ContactSuccess>
            ) : (
              <form onSubmit={handleSubmit} autoComplete="off">
                <FormRow>
                  <FormField>
                    <label>Name</label>
                    <input name="name" value={form.name} onChange={handleChange} required />
                  </FormField>
                  <FormField>
                    <label>Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required />
                  </FormField>
                </FormRow>
                <FormRow>
                  <FormField>
                    <label>Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} />
                  </FormField>
                </FormRow>
                <FormRow>
                  <FormField style={{ width: '100%' }}>
                    <label>Message</label>
                    <textarea name="message" value={form.message} onChange={handleChange} rows={5} required />
                  </FormField>
                </FormRow>
                <SubmitButton type="submit">Send Message</SubmitButton>
              </form>
            )}
          </ContactFormCol>
        </ContactCard>
        <MapSection>
          <MapTitle>Find Us</MapTitle>
          <MapIframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3172.3327925305077!2d-121.9473!3d37.3022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808e33c9c6c3c6b1%3A0x9c7c6c3c6c3c6c3c!2s345%20Saratoga%20Ave%2C%20San%20Jose%2C%20CA%2095129!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Map"
          />
        </MapSection>
      </ContactPageOuter>
      <Footer />
    </>
  );
};

const ContactPageOuter = styled.div`
  width: 100%;
  min-height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 0 3rem 0;
`;

const ContactCard = styled.div`
  display: flex;
  gap: 2.5rem;
  justify-content: center;
  align-items: stretch;
  width: 100%;
  max-width: 1100px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 18px rgba(44,62,80,0.10);
  margin: 4.5rem auto 2.5rem auto;
  padding: 2.5rem 2.2rem;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 1.2rem;
    max-width: 98vw;
    padding: 1.2rem;
  }
`;

const ContactInfoCol = styled.div`
  flex: 1 1 320px;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  justify-content: flex-start;
  min-width: 220px;
`;

const ContactTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: #2E4154;
  margin-bottom: 0.7rem;
`;

const ContactInfoItem = styled.div`
  font-size: 1.13rem;
  color: #222;
  margin-bottom: 0.2rem;
  b {
    color: #2E4154;
    font-weight: 600;
  }
  a {
    color: #2E4154;
    text-decoration: underline;
    font-weight: 500;
  }
`;

const ContactFormCol = styled.div`
  flex: 2 1 400px;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  background: #f7fafd;
  border-radius: 14px;
  box-shadow: 0 1px 8px rgba(44,62,80,0.06);
  padding: 2rem 1.5rem;
  @media (max-width: 900px) {
    width: 100%;
    min-width: unset;
    max-width: unset;
    padding: 1.2rem;
  }
`;

const ContactFormTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2E4154;
  margin-bottom: 0.7rem;
`;

const ContactSuccess = styled.div`
  color: #217a3c;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 1.2rem 0;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1.2rem;
  width: 100%;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 0.7rem;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.3rem;
  label {
    font-size: 1rem;
    font-weight: 500;
    color: #2E4154;
    margin-bottom: 0.2rem;
  }
  input, textarea {
    border: 1.5px solid #e0eafc;
    border-radius: 7px;
    padding: 0.7rem 1rem;
    font-size: 1rem;
    font-family: inherit;
    outline: none;
    transition: border 0.18s;
    background: #fff;
    resize: none;
  }
  input:focus, textarea:focus {
    border-color: #2E4154;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(90deg, #2E4154 0%, #4F8DFD 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  padding: 0.9rem 2.2rem;
  margin-top: 1.1rem;
  cursor: pointer;
  transition: background 0.18s;
  box-shadow: 0 1px 4px rgba(44,62,80,0.07);
  &:hover {
    background: linear-gradient(90deg, #4F8DFD 0%, #2E4154 100%);
  }
`;

const MapSection = styled.section`
  width: 100%;
  max-width: 1100px;
  margin: 2.5rem auto 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(44,62,80,0.08);
  padding: 2rem 2.2rem;
  @media (max-width: 900px) {
    max-width: 98vw;
    padding: 1.2rem;
  }
`;

const MapTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  color: #2E4154;
  margin-bottom: 1.2rem;
`;

const MapIframe = styled.iframe`
  width: 100%;
  height: 320px;
  border: none;
  border-radius: 12px;
  margin-top: 0.5rem;
`;

export default Contact; 