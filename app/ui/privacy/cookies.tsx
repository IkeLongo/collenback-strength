"use client";

import { useState } from 'react';
import CookiePreferences from '../cookies/preferences';

export default function Cookies() {
  const [preferencesOpen, setPreferencesOpen] = useState<boolean>(false);

  return (
    <section className='pb-8 max-w-[60em]'>
      <h4 className="my-2">What is a Cookie?</h4>
      <p className="text-left pb-4">A cookie is a small data file stored in your computer, tablet or smartphone. A cookie is not a program and cannot carry harmful malware or viruses.</p>
      <h4 className="my-2">How Our Website Utilizes Cookies</h4>
      <p className="text-left pb-4">Cookies are essential for certain functionalities of our website. They also give us insights into your visit, allowing us to continuously improve and tailor your experience based on your preferences and interests. For instance, cookies help remember items in your shopping cart, whether you've visited before, your login status, and your preferred language or currency. Additionally, cookies enable us to personalize advertisements for you on other platforms. Overall, cookies enhance our services by providing you with relevant content.</p>
      <p className="text-left">We categorize the use of cookies into three main areas:</p>
      <ol className="list-decimal pl-6 mt-4 pb-4 flex flex-col gap-2">
        <li className="text-white">Functional</li>
        <li className="text-white">Statistical</li>
        <li className="text-white">Marketing</li>
      </ol>
      <h4 className="my-2">Cookie Storage Duration</h4>
      <p className="text-left pb-4">The storage duration of cookies varies based on the specific type and the time of your last visit. Once a cookie expires, it is automatically deleted. The lifespan of each cookie is outlined in our cookie policy.</p>
      <h4 className="my-2">Managing or Deleting Cookies</h4>
      <p className="text-left pb-4">You can block all or specific third-party cookies at any time by adjusting your browser settings on your device. The exact process depends on your browser (e.g., Chrome, Firefox, Safari) and device type (e.g., desktop, tablet, smartphone). However, blocking cookies may impact certain features and services on our website that rely on them. <a href="https://tools.google.com/dlpage/gaoptout" className="text-royal-blue-500 hover:underline">You can opt-out of cookies from Google Analytics here</a>.</p>
      <h4 className="my-2">How to Delete Cookies</h4>
      <p className="text-left pb-4">If you've previously accepted cookies, you can remove them at any time. The steps vary depending on the browser and device you're using:</p>
      <ul className="list-disc marker:text-white pl-6 pb-4 mt-4 flex flex-col gap-2">
        <li><a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d#ie=ie-11" className="text-royal-blue-500 hover:underline">Internet Explorer</a></li>
        <li><a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d" className="text-royal-blue-500 hover:underline">Microsoft Edge</a></li>
        <li><a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox?redirectslug=delete-cookies-remove-info-websites-stored&redirectlocale=en-US" className="text-royal-blue-500 hover:underline">Mozilla Firefox</a></li>
        <li><a href="https://support.google.com/chrome/answer/95647?hl=en" className="text-royal-blue-500 hover:underline">Google Chrome</a></li>
        <li><a href="https://help.opera.com/en/latest/web-preferences/#cookies" className="text-royal-blue-500 hover:underline">Opera</a></li>
        <li><a href="https://support.apple.com/en-us/105082" className="text-royal-blue-500 hover:underline">Safari</a></li>
        <li><a href="https://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager07.html" className="text-royal-blue-500 hover:underline">Flash cookies</a></li>
        <li><a href="https://support.apple.com/en-us/105082" className="text-royal-blue-500 hover:underline">Apple</a></li>
        <li><a href="https://discover.hubpages.com/technology/How-to-delete-internet-cookies-on-your-Droid-or-any-Android-device" className="text-royal-blue-500 hover:underline">Android</a></li>
        <li><a href="https://support.google.com/chrome/answer/95647?co=GENIE.Platform%3DAndroid&hl=en" className="text-royal-blue-500 hover:underline">Chrome, Android</a></li>
      </ul>
      <p className="text-left pb-4">Instructions are typically found under "Settings" → "Security and Privacy," though this may differ based on your browser.</p>
      <h4 className="my-2">Changing Your Cookie Consent</h4>
      <p className="text-left pb-4">You can update your cookie preferences by either deleting cookies from your browser or modifying your previous consent via this <a onClick={() => setPreferencesOpen(true)} className="text-royal-blue-500 hover:underline cursor-pointer">link</a>.</p>
      <CookiePreferences isOpen={preferencesOpen} onClose={() => setPreferencesOpen(false)} />
      <p className="text-left pb-4"><strong>Note: </strong>If you use multiple browsers, you will need to adjust settings for each one individually.</p>
      <h4 className="my-2">Have Questions?</h4>
      <p className="text-left">For inquiries or comments regarding our cookie policy or data processing practices, feel free to contact us using the form below.</p>
    </section>
  )
}