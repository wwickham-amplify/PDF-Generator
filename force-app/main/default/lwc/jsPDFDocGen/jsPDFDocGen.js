import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { loadScript } from 'lightning/platformResourceLoader';
import JS_PDF from '@salesforce/resourceUrl/jsPDF';

import FIRSTNAME_FIELD from '@salesforce/schema/PD_Completion__c.First_Name__c';
import LASTNAME_FIELD from '@salesforce/schema/PD_Completion__c.Last_Name__c';
import MIDDLENAME_FIELD from '@salesforce/schema/PD_Completion__c.Middle_Initial__c';
import DOB_FIELD from '@salesforce/schema/PD_Completion__c.Date_of_Birth__c';
import SSN_FIELD from '@salesforce/schema/PD_Completion__c.Last_4_of_SSN__c';
import VENUE_DETAILS_FIELD from '@salesforce/schema/PD_Completion__c.Venue_Details__c';
import CTLEACTIVITY_TITLE from '@salesforce/schema/PD_Completion__c.CTLE_Activity_Title__c';
import AREAOFACTIVTY_FIELD from '@salesforce/schema/PD_Completion__c.Select_One_or_More_Areas_of_Activity__c';
import CTLEDATEFROM_FIELD from '@salesforce/schema/PD_Completion__c.CTLE_Date_from__c';
import CTLEDATETO_FIELD from '@salesforce/schema/PD_Completion__c.CTLE_Date_to__c';
import NUMBEROFHOURSAWARDED_FIELD from '@salesforce/schema/PD_Completion__c.Number_of_Hours_Awarded__c';
import CERTIFICATIONSTATEMENT_FIELD from '@salesforce/schema/PD_Completion__c.Certification_Statement__c';
import APPROVEDSPONSOR_FIELD from '@salesforce/schema/PD_Completion__c.Approved_Sponsor_Name__c';
import PRINTNAMEOFCERTOFFICER_FIELD from '@salesforce/schema/PD_Completion__c.Print_Name_of_Auth_Certifying_Officer__c';
import SIGNATUREOFCERTOFFICER_FIELD from '@salesforce/schema/PD_Completion__c.Signature_of_Auth_Certifying_Officer__c';
import APPROVEDSPONSORID_FIELD from '@salesforce/schema/PD_Completion__c.Approved_Sponsor_Identification_Number__c';
import DATE_FIELD from '@salesforce/schema/PD_Completion__c.Date__c';
import EMAIL_FIELD from '@salesforce/schema/PD_Completion__c.Email__c';
import PHONE_FIELD from '@salesforce/schema/PD_Completion__c.Phone__c';

const FIELDS = [FIRSTNAME_FIELD, LASTNAME_FIELD, MIDDLENAME_FIELD, DOB_FIELD, SSN_FIELD, VENUE_DETAILS_FIELD, CTLEACTIVITY_TITLE, AREAOFACTIVTY_FIELD, CTLEDATEFROM_FIELD, CTLEDATETO_FIELD, NUMBEROFHOURSAWARDED_FIELD, CERTIFICATIONSTATEMENT_FIELD, APPROVEDSPONSOR_FIELD, APPROVEDSPONSORID_FIELD, PRINTNAMEOFCERTOFFICER_FIELD, SIGNATUREOFCERTOFFICER_FIELD, DATE_FIELD, EMAIL_FIELD, PHONE_FIELD];

export default class JsPDFDocGen extends LightningElement {
  jsPDFInitialized = false;

  @api recordId;
  @api pdCompletion;
  @api dateOfBirth;
  @api SSN;
  
  ctleDateFrom;
  ctleDateTo;
  numberOfHours;
  pedagogy = false;
  content = false;
  englishLanguage = false;

  //pdCompletion;

  /*@wire(getRecord, { recordId: '$recordId', fields: FIELDS })
  wiredPDCompletion({ error, data }) {
      if (data) {
          this.pdCompletion = data;
          this.ctleDateFrom = this.convertDate(this.sanitize(this.pdCompletion?.fields?.CTLE_Date_from__c?.value));
          this.ctleDateTo = this.convertDate(this.sanitize(this.pdCompletion?.fields?.CTLE_Date_to__c?.value));
          this.numberOfHours = this.sanitize(this.pdCompletion?.fields?.Number_of_Hours_Awarded__c?.value);
          const rawValue = this.pdCompletion?.fields?.Select_One_or_More_Areas_of_Activity__c?.value || '';
          const areaOfActivities = rawValue.split(';').filter(Boolean);
          areaOfActivities.forEach(activity => {
            console.log(activity);
              if (activity === 'Pedagogy') {
                  this.pedagogy = true;
              } else if (activity === 'Content') {
                  this.content = true;
              } else if (activity === 'English Language Learning') {
                  this.englishLanguage = true;
              }
          });
      } else if (error) {
          console.error(error);
      }
  }*/

  connectedCallback() {
    console.log(JSON.parse(JSON.stringify(this.pdCompletion)));
    this.ctleDateFrom = this.convertDate(this.sanitize(this.pdCompletion?.CTLE_Date_from__c));
    this.ctleDateTo = this.convertDate(this.sanitize(this.pdCompletion?.CTLE_Date_to__c));
    this.numberOfHours = this.sanitize(this.pdCompletion?.Number_of_Hours_Awarded__c);
    const rawValue = this.pdCompletion?.Select_One_or_More_Areas_of_Activity__c || '';
    const areaOfActivities = rawValue.split(';').filter(Boolean);
    areaOfActivities.forEach(activity => {
      console.log(activity);
        if (activity === 'Pedagogy') {
            this.pedagogy = true;
        } else if (activity === 'Content') {
            this.content = true;
        } else if (activity === 'English Language Learning') {
            this.englishLanguage = true;
        }
    });
  }

  sanitize(value) {
    console.log(String(value));
    return String(value) ?? '';
  }

  trimTitle(value) {
    let trimmed = value.split("(")[0];

    if(trimmed.length > 62) {
      trimmed = trimmed.substring(0, 62) + '...';
    }

    return trimmed;
  }

  convertDate(value) {
    let input = value;
    console.log("input: " + input);

    if(input === undefined) return "";

    const date = new Date(input.replace(/-/g, '\/'));
    console.log("date: " + date);
    if(isNaN(date)) return "";

    const [month, day, year] = [
      (date.getMonth() + 1).toString().padStart(2, "0"),
      date.getDate().toString().padStart(2, "0"),
      date.getFullYear(),
    ];

    console.log("full date: " + `${month}/${day}/${year}`);

    return `${month}/${day}/${year}`;
  }

  /*@api firstName;
  @api lastName;
  @api middleInitial;
  @api dateOfBirth;
  @api last4SSN;
  @api nameOfVenue;
  @api streetAddress;
  @api city;
  @api state;
  @api zipCode;
  @api ctleActivityTitle;
  @api areaOfActivity;
  @api ctleDateFrom;
  @api ctleDateTo;
  @api ctleHours;
  @api approvedSponsorName;
  @api printNameOfAuthorizedCertifyingOfficer;
  @api signatureOfAuthorizedCertifyingOfficer;
  @api approvedSponsorIdNumber;
  @api signatureDate;
  @api email;
  @api phone;*/

  renderedCallback() {
    if (!this.jsPDFInitialized) {
      this.jsPDFInitialized = true;
      loadScript(this, JS_PDF)
        .then(() => {
          console.log('jsPDF library loaded successfully');
        })
        .catch((error) => {
          console.error('Error loading jsPDF library', error);
        });
    }
  }

  handleGeneratePDF() {
    if (this.jsPDFInitialized) {
      // Make sure to correctly reference the loaded jsPDF library.
      const doc = new window.jspdf.jsPDF({ orientation: "portrait", unit: "pt", format: [612, 792] });

      // Get page width to center text
      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = pageWidth / 2;

      // Line height spacing
      const lineHeight = 14;
      let y = 44; // starting Y position
      let x = 34;

      console.log(doc.getFontList());

      // First line (normal text)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("The University of the State of New York", centerX, y, { align: "center" });

      // Second line (bold text)
      y += lineHeight;
      doc.setFont("helvetica", "bold");
      doc.text("THE STATE EDUCATION DEPARTMENT", centerX, y, { align: "center" });

      y += lineHeight;
      doc.setFont("helvetica", "normal");
      doc.text("Office of Teaching Initiatives", centerX, y, { align: "center" });

      // Third line (link)
      y += lineHeight;
      doc.setTextColor(0, 0, 255); // blue link color

      const linkText = "www.highered.nysed.gov/tcert";

      doc.textWithLink(linkText, centerX, y, {
        url: "www.highered.nysed.gov/tcert",
        align: "center"
      });

      let textWidth = doc.getTextWidth(linkText);
      doc.setDrawColor(0, 0, 255);
      doc.line(centerX - textWidth / 2, y + 0.75, centerX + textWidth / 2, y );

      // Reset text color (in case you write more later)
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(0, 0, 0);

      y += lineHeight * 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Completion of Approved Continuing Teacher and Leader Education (CTLE) Hour(s) Certificate", centerX, y, { align: "center" });

      y += lineHeight * 2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("All CTLE must be completed with Approved Sponsors and be reported using this form, or an alternative form/format that", x + 2, y, { align: "left"});

      y += lineHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("captures the same information that is requested on this form, in addition to any electronic reporting requirements.", x + 2, y, { align: "left" });
      
      y += lineHeight * 2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      let underlineText = "Instructions for the Trainee:";
      doc.text(underlineText, x + 2, y, { align: "left" });

      textWidth = doc.getTextWidth(underlineText);
      doc.line((x + 2), y + 0.5, (x + 2) + textWidth, y );

      y += lineHeight * 2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Please complete Section I and retain your copy for at least three years from the end of the registration period in which you", x + 2, y, { align: "left" });

      y += lineHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("completed the CTLE. It is not necessary to send a copy of this form to the Office of Teaching Initiatives unless it is", x + 2, y, { align: "left" });

      y += lineHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      //not actually underlinetext, just reusing variables
      underlineText = "requested by the State Education Department or for use in obtaining an Initial Reissuance. ";
      doc.text(underlineText, x + 2, y, { align: "left"});

      textWidth = doc.getTextWidth(underlineText);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(" A separate form must be", x + 2 + textWidth, y);

      y += lineHeight;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("completed for each training.", x + 2, y, { align: "left" });
      
      y += lineHeight * 2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      underlineText = "Instructions for the Approved CTLE Sponsor:";
      doc.text(underlineText, x + 2, y, { align: "left" });

      textWidth = doc.getTextWidth(underlineText);
      doc.line((x + 2), y + 0.5, (x + 2) + textWidth, y );

      y += lineHeight * 2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Please complete Sections II and III. These sections must be completed by the Approved CTLE Sponsor authorized", x + 2, y, { align: "left" });

      y += lineHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("individual. Sponsors must verify that the trainee completed the activity, the title, date(s) and number of hours", x + 2, y, { align: "left" });

      y += lineHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("awarded. Records must be retained for a period of eight years. You may use an alternative form or format, however", x + 2, y, { align: "left" });

      y += lineHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("that alternative must capture the same information that is requested on this form.", x + 2, y, { align: "left" });

      const formData = [
        {
          title: "Section I",
          headerHeight: 16,
          rows: [
            {
              height: 25,
              cells: [
                { label: "First Name:", value: this.sanitize(this.pdCompletion?.First_Name__c), width: 40 },
                { label: "Last Name:", value: this.sanitize(this.pdCompletion?.Last_Name__c), width: 40 },
                { label: "Middle Initial:", value: this.sanitize(this.pdCompletion?.Middle_Initial__c), width: 20 }
              ]
            },
            {
              height: 25,
              cells: [
                { label: "Date of Birth:", value: this.convertDate(this.dateOfBirth), width: 40 },
                { label: "Last 4 Digits of the Social Security Number:", value: this.sanitize(this.SSN), width: 60 }
              ]
            }
          ]
        },
        {
          title: "Section II",
          headerHeight: 16,
          rows: [
            {
              height: 50,
              cells: [
                { label: "Venue Details:", value: this.sanitize(this.pdCompletion?.Venue_Details__c), width: 100 }
              ]
            },
            /*{
              height: 25,
              cells: [
                { label: "Street Address:", value: "11111 101 Street", width: 40 },
                { label: "City:", value: "Big City", width: 30 },
                { label: "State:", value: "TX", width: 10 },
                { label: "Zip Code:", value: "11111", width: 20 }
              ]
            },*/
            {
              height: 25,
              cells: [
                { label: "CTLE Activity Title:", value: this.trimTitle(this.sanitize(this.pdCompletion?.CTLE_Activity_Title__c)), width: 100 }
              ]
            },
            {
              height: 25,
              cells: [
                { label: "Select One or More Areas of Activity:", value: "", width: 100 }
              ]
            },
            {
              height: 25,
              cells: [
                { label: "CTLE Date(s):", value: "", width: 100 }
              ]
            }
          ]
        },
        {
          title: "Section III",
          headerHeight: 16,
          rows: [
            {
              height: 25,
              cells: [
                { label: this.sanitize(this.pdCompletion?.Certification_Statement__c), value: "", width: 100 }
              ]
            },
            {
              height: 25,
              cells: [
                { label: "Approved Sponsor Name:", value: this.sanitize(this.pdCompletion?.Approved_Sponsor_Name__c), width: 100 }
              ]
            },
            {
              height: 25,
              cells: [
                { label: "Print Name of Authorized Certifying Officer:", value: this.sanitize(this.pdCompletion?.Print_Name_of_Auth_Certifying_Officer__c), width: 100 }
              ]
            },
            {
              height: 25,
              cells: [
                { label: "Signature of Authorized Certifying Officer:", value: "", width: 100 }
              ]
            },
            {
              height: 25,
              cells: [
                { label: "Approved Sponsor Identification Number:", value: this.sanitize(this.pdCompletion?.Approved_Sponsor_Identification_Number__c), width: 60 },
                { label: "Date:", value: this.convertDate(this.sanitize(this.pdCompletion?.Date__c)), width: 40 }
              ]
            },
            {
              height: 25,
              cells: [
                { label: "Email:", value: this.sanitize(this.pdCompletion?.Email__c), width: 60 },
                { label: "Phone Number:", value: this.sanitize(this.pdCompletion?.Phone__c), width: 40 }
              ]
            }
          ]
        }
      ];

      let startY = y + lineHeight;

      formData.forEach(section => {
        // --- Section Header ---
        doc.setFillColor(198, 217, 241); // light blue
        doc.rect(36, startY, pageWidth - 72, section.headerHeight, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(section.title, 40, startY + 12);
    
        startY += section.headerHeight;
    
        // --- Rows ---
        section.rows.forEach(row => {
          let x = 36;
    
          row.cells.forEach(cell => {
            // Draw cell
            doc.rect(x, startY, (pageWidth - 72) * (cell.width / 100), row.height);
    
            // Label
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.text(cell.label, x + 4, startY + 11, {maxWidth: (pageWidth - 72) * (cell.width / 100) + 4});
    
            // Value (offset after label width)
            const labelWidth = doc.getTextWidth(cell.label);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(14);
            doc.text( cell.value, x + 4 + labelWidth + 4, startY + 14);
    
            x += (pageWidth - 72) * (cell.width / 100); // next cell
          });
    
          startY += row.height; // next row
        });
    
      });


      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text( "(Indicate title/subject/grade level, etc.)", centerX, (startY - ((25 * 9) + 16)) + 22, {align: "center"});

      doc.line(x + 81, (startY - ((25 * 9) + 16)) + 16, (x + 81) + 426, (startY - ((25 * 9) + 16)) + 16 );

      doc.line(x + 154, (startY - ((25 * 8) + 16)) + 16, (x + 154) + 40, (startY - ((25 * 8) + 16)) + 16 );

      if(this.pedagogy) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text( "Y", x + 174, (startY - ((25 * 8) + 16)) + 14);
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text( "Pedagogy", x + 200, (startY - ((25 * 8) + 16)) + 14);

      doc.line(x + 260, (startY - ((25 * 8) + 16)) + 16, (x + 260) + 45, (startY - ((25 * 8) + 16)) + 16 );

      if(this.content) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text( "Y", x + 280, (startY - ((25 * 8) + 16)) + 14);
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text( "Content", x + 306, (startY - ((25 * 8) + 16)) + 14);

      doc.line(x + 350, (startY - ((25 * 8) + 16)) + 16, (x + 350) + 36, (startY - ((25 * 8) + 16)) + 16 );

      if(this.englishLanguage) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text( "Y", x + 368, (startY - ((25 * 8) + 16)) + 14);
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text( "English Language Learning", x + 390, (startY - ((25 * 8) + 16)) + 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text( "from:", 103, 562);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text( this.ctleDateFrom, 140, 562);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text( "(mm) (dd)   (yyyy)", 140, 570);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text( "(mm) (dd)   (yyyy)", 250, 570);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text( 'to:', 230, 562);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text( this.ctleDateTo, 250, 562);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text( "Number of hours awarded", 390, 564);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text( this.numberOfHours, 532.8, 565);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text( "(Rev. 06/2020)", 36, 750.88);

      var base64Img = 'data:image/png;base64,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';
      doc.addImage(base64Img, 'PNG', 216, 666, 100, 20);

      doc.save("PD Completion Certificate.pdf");
    } else {
      console.error('jsPDF library not initialized');
    }
  }
}