import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { loadScript } from 'lightning/platformResourceLoader';
import JS_PDF from '@salesforce/resourceUrl/jsPDF';
import signature from "@salesforce/resourceUrl/Authorizer_Signature";

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
  @api dateOfBirth;
  @api SSN;
  
  ctleDateFrom;
  ctleDateTo;
  numberOfHours;
  pedagogy = false;
  content = false;
  englishLanguage = false;


  pdCompletion;

  @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
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
  }

  sanitize(value) {
    console.log(String(value));
    return String(value) ?? '';
  }

  convertDate(value) {
    let input = value;
    console.log("input: " + input);

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
                { label: "First Name:", value: this.sanitize(this.pdCompletion?.fields?.First_Name__c?.value), width: 40 },
                { label: "Last Name:", value: this.sanitize(this.pdCompletion?.fields?.Last_Name__c?.value), width: 40 },
                { label: "Middle Initial:", value: this.sanitize(this.pdCompletion?.fields?.Middle_Initial__c?.value), width: 20 }
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
                { label: "Venue Details:", value: this.sanitize(this.pdCompletion?.fields?.Venue_Details__c?.value), width: 100 }
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
                { label: "CTLE Activity Title:", value: this.sanitize(this.pdCompletion?.fields?.CTLE_Activity_Title__c?.value), width: 100 }
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
                { label: this.sanitize(this.pdCompletion?.fields?.Certification_Statement__c?.value), value: "", width: 100 }
              ]
            },
            {
              height: 25,
              cells: [
                { label: "Approved Sponsor Name:", value: this.sanitize(this.pdCompletion?.fields?.Approved_Sponsor_Name__c?.value), width: 100 }
              ]
            },
            {
              height: 25,
              cells: [
                { label: "Print Name of Authorized Certifying Officer:", value: this.sanitize(this.pdCompletion?.fields?.Print_Name_of_Auth_Certifying_Officer__c?.value), width: 100 }
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
                { label: "Approved Sponsor Identification Number:", value: this.sanitize(this.pdCompletion?.fields?.Approved_Sponsor_Identification_Number__c?.value), width: 60 },
                { label: "Date:", value: this.convertDate(this.sanitize(this.pdCompletion?.fields?.Date__c?.value)), width: 40 }
              ]
            },
            {
              height: 25,
              cells: [
                { label: "Email:", value: this.sanitize(this.pdCompletion?.fields?.Email__c?.value), width: 60 },
                { label: "Phone Number:", value: this.sanitize(this.pdCompletion?.fields?.Phone__c?.value), width: 40 }
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
      doc.setFontSize(11);
      doc.text( this.numberOfHours, 532.8, 564);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text( "(Rev. 06/2020)", 36, 750.88);

      console.log('signature: ' + signature);

      var signatureImg = new Image();
      signatureImg.src = signature;

      doc.addImage(signatureImg, 'png', 216, 666, 100, 20);
      // --- Section Header ---
      //doc.setFillColor(200, 220, 255); // light blue background
      //doc.rect(10, startY, pageWidth - 20, 6, "F"); // filled rect
      //doc.rect(10, startY, pageWidth - 20, 6);
      //doc.setFont("helvetica", "bold");
      //doc.setFontSize(11);
      //doc.text("Section I", 12, startY + 4);

      //startY += 6;

      //const labels = ["First Name:", "Last Name:", "Middle Initial:"];
      //const values = [this.firstName, this.lastName, this.middleInitial];

      // --- First Row (3 columns) ---
      //doc.setFont("helvetica", "normal");
     // doc.setFontSize(9);
      //x = 10;
      //labels.forEach((label, i) => {
       // doc.rect(x, startY, colWidths[i], rowHeight); // border
       // doc.setFont("helvetica", "normal");
       // doc.setFontSize(9);
        //doc.text(label, x + 2, startY + 3);

        //const labelWidth = doc.getTextWidth(label);

        //doc.setFontSize(14);
        //doc.text(values[i], x + 2 + labelWidth + 2, startY + 6);

        //x += colWidths[i];
      //});

      //startY += rowHeight;

      // --- Second Row (2 columns) ---
      //x = 10;
      //const secondRowCols = [100, pageWidth - 20 - 100];
      //["Date of Birth:", "Last 4 Digits of the Social Security Number:"].forEach(
      //  (label, i) => {
      //    doc.rect(x, startY, secondRowCols[i], rowHeight); // border
      //    doc.text(label, x + 2, startY + 3);
      //    x += secondRowCols[i];
      //  }
      //);

      doc.save("PD Completion Certificate.pdf");
    } else {
      console.error('jsPDF library not initialized');
    }
  }
}