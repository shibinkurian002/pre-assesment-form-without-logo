/* script.js */

document.addEventListener('DOMContentLoaded', function() {
    /* ===================== STEP NAVIGATION LOGIC ===================== */
    const steps = document.querySelectorAll('.form-step');
    let currentStep = 0;
    const form = document.getElementById('assessmentForm');

    function showStep(index) {
        steps.forEach((step, i) => {
            step.classList.remove('active');
            if (i === index) {
                step.classList.add('active');
            }
        });
        currentStep = index;
    }

    showStep(0);

    const navigationButtons = [
        { nextBtnId: 'nextBtn1', prevBtnId: null, nextStep: 1, prevStep: null },
        { nextBtnId: 'nextBtn2', prevBtnId: 'prevBtn2', nextStep: 2, prevStep: 0 },
        { nextBtnId: 'nextBtn3', prevBtnId: 'prevBtn3', nextStep: 3, prevStep: 1 },
        { nextBtnId: 'nextBtn4', prevBtnId: 'prevBtn4', nextStep: 4, prevStep: 2 },
        { nextBtnId: 'nextBtn5', prevBtnId: 'prevBtn5', nextStep: 5, prevStep: 3 },
        { nextBtnId: 'nextBtn6', prevBtnId: 'prevBtn6', nextStep: 6, prevStep: 4 },
        { nextBtnId: 'nextBtn7', prevBtnId: 'prevBtn7', nextStep: 7, prevStep: 5 },
        { nextBtnId: 'nextBtn8', prevBtnId: 'prevBtn8', nextStep: 8, prevStep: 6 },
        { nextBtnId: null, prevBtnId: 'prevBtn9', nextStep: null, prevStep: 7 }
    ];

    navigationButtons.forEach(buttonConfig => {
        if (buttonConfig.nextBtnId) {
            document.getElementById(buttonConfig.nextBtnId).addEventListener('click', () => showStep(buttonConfig.nextStep));
        }
        if (buttonConfig.prevBtnId) {
            document.getElementById(buttonConfig.prevBtnId).addEventListener('click', () => showStep(buttonConfig.prevStep));
        }
    });

    /* ===================== AUTO-CALCULATE AGE & BMI ===================== */
    const dobField = document.getElementById('dob');
    const ageField = document.getElementById('age');
    const weightField = document.getElementById('currentWeight');
    const heightField = document.getElementById('currentHeight');
    const bmiField = document.getElementById('bmiScore');

    dobField.addEventListener('change', () => {
        const dobValue = dobField.value;
        if (!dobValue) return;
        const dobDate = new Date(dobValue);
        const diffMs = Date.now() - dobDate.getTime();
        const ageYears = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
        ageField.value = `${ageYears} years`;
    });

    function recalcBMI() {
        const w = parseFloat(weightField.value);
        const h = parseFloat(heightField.value);
        if (w > 0 && h > 0) {
            const bmi = w / (h * h);
            bmiField.value = bmi.toFixed(1);
        }
    }
    weightField.addEventListener('input', recalcBMI);
    heightField.addEventListener('input', recalcBMI);

    /* ===================== SUMMARY & PDF ===================== */
    const generateSummaryBtn = document.getElementById('generateSummaryBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const summaryArea = document.getElementById('summary');
    const { jsPDF } = window.jspdf;

    function getFormData() {
        const formData = {};
        const formElements = form.elements;

        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];
            if (element.name) {
                if (element.type === 'checkbox') {
                    formData[element.name] = element.checked ? 'Yes' : 'No';
                } else {
                    formData[element.name] = element.value;
                }
            }
        }
        return formData;
    }

    generateSummaryBtn.addEventListener('click', () => {
        const data = getFormData();
        summaryArea.value = Object.entries(data)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n\n');
    });

    downloadPdfBtn.addEventListener('click', () => {
        const data = getFormData();
        const doc = new jsPDF();
        let y = 40;
        let pageWidth = doc.internal.pageSize.getWidth();
        let marginX = 15;
        let sectionSpacing = 20;
        let stepHeadingFontSize = 19;
        let labelFontSize = 12;
        let valueFontSize = 12;
        let inputGroupVerticalSpacing = 14;

        // Function to add styled text
        function addStyledText(text, x, y, fontSize, fontStyle = 'normal', fontWeight = 'normal') {
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', fontStyle, fontWeight);
            let lines = doc.splitTextToSize(text, pageWidth - 2 * marginX);
            lines.forEach(line => {
                doc.text(line, x, y);
                y += fontSize * 0.353 * 1.3;
            });
            return y;
        }

        // ==========================  FIXED HEADER CODE - PLEASE REPLACE YOUR HEADER WITH THIS  ==========================
        doc.setFillColor('#007bff');
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setFontSize(18);
        doc.setTextColor('#ffffff');
        doc.setFont('helvetica', 'bold'); // Set font style to bold only, no weight argument
        doc.text("Resident Assessment Form", pageWidth / 2, 20, { align: 'center' });
        doc.setTextColor('#000000'); // Reset text color for main content
        y = 40;
        // ==========================  END FIXED HEADER CODE  ==========================


        let stepNumber = 1;
        steps.forEach(step => {
            if (step.id === 'step-9') return;

            // Step Heading
            y = addStyledText(`${step.querySelector('h2').textContent}`, marginX, y, stepHeadingFontSize, 'bold', 'bold');
            y += 10;

            step.querySelectorAll('.input-group').forEach(inputGroup => {
                let labelElement = inputGroup.querySelector('label');
                let inputElement = inputGroup.querySelector('input, textarea');
                if (labelElement && inputElement && inputElement.name && data.hasOwnProperty(inputElement.name)) {
                    let labelText = labelElement.textContent;
                    if (labelText.endsWith('*')) {
                        labelText = labelText.slice(0, -1).trim();
                    }

                    // Label
                    y = addStyledText(`${labelText}`, marginX + 5, y, labelFontSize, 'normal', 'bold');
                    y += 6;

                    // Value
                    let valueText = data[inputElement.name] || 'N/A';
                    y = addStyledText(valueText, marginX + 10, y, valueFontSize, 'normal', 'normal');
                    y += inputGroupVerticalSpacing;

                    if (y > 270) {
                        doc.addPage();
                        y = 40;
                        y = addStyledText(`${step.querySelector('h2').textContent}`, marginX, y, stepHeadingFontSize, 'bold', 'bold');
                        y += 10;
                    }
                }
                else if (inputGroup.classList.contains('checkbox-group')) {
                    // Checkbox groups
                    let checkboxes = inputGroup.querySelectorAll('input[type="checkbox"]');
                    if (checkboxes.length > 0) {
                        y = addStyledText(`${inputGroup.textContent.trim()}:`, marginX + 5, y, labelFontSize, 'normal', 'bold');
                        y += 6;

                        checkboxes.forEach(checkbox => {
                            let label = checkbox.nextElementSibling;
                            if (label && data.hasOwnProperty(checkbox.name)) {
                                let checkboxText = label.textContent.trim();
                                let value = data[checkbox.name];
                                let displayValue = value === 'Yes' ? '[X] Yes' : '[ ] No';
                                y = addStyledText(`  ${displayValue} ${checkboxText}`, marginX + 20, y, valueFontSize, 'normal', 'normal');
                                y += 10;
                            }
                        });
                         y += inputGroupVerticalSpacing - 10;

                    }
                }
            });
            y += sectionSpacing;

            if (stepNumber < 9 && y > 240) {
                doc.addPage();
                y = 40;
            }
            stepNumber++;
        });

        doc.save('assessment.pdf');
    });
});
