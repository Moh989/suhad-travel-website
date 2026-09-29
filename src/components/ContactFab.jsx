import React, { useEffect, useState } from 'react';
import { featureOn, useContent } from '../content/index.js';
import { isEmail } from '../lib/text.js';
import Icon from '../ui/Icon.jsx';

// يختفي الزر حين تكون الواجهة أو النموذج أو قسم التواصل ظاهرة، فلا يكرر ما على الشاشة.
const HIDE_NEAR = ['home', 'plan', 'contact'];

export default function ContactFab() {
  const content = useContent();
  const { fab, contact } = content;
  const enabled = featureOn(content, 'floatingButton');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    const targets = HIDE_NEAR.map((id) => document.getElementById(id)).filter(Boolean);
    if (!('IntersectionObserver' in window) || !targets.length) return undefined;
    const showing = new Map();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => showing.set(e.target.id, e.isIntersecting));
      setVisible(![...showing.values()].some(Boolean));
    });
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled) return null;
  const href = isEmail(contact.email) ? `mailto:${contact.email.trim()}` : '#contact';

  return (
    <a className="fab" href={href} data-visible={visible}>
      <Icon name="mail" size={20} />
      <span>{fab.label}</span>
    </a>
  );
}
