import { Injectable } from '@angular/core';
import emailjs from 'emailjs-com';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  sendVerificationEmail(toEmail: string, toName: string, verifyLink: string) {
    const templateParams = {
      email: toEmail,
      name: toName,
      verify_link: verifyLink
    };
  

    return emailjs.send(
      'service_rncpdq4',     // e.g., service_gmail
      'template_02eovvk',    // e.g., account_verification
      templateParams,
      '1hwfDCPPuy5q9VyQa'      // e.g., A34HJDG6DsfHH
    );
  }
}
