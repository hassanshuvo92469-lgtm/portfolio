document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("submitButton");
  const resultBox = document.getElementById("form-results");

  const inputs = form.querySelectorAll("[data-validate]");

  /* ======================
     VALIDATION
  ====================== */

  function validateInput(input) {
    const type = input.dataset.validate;
    const value = input.value.trim();
    let valid = true;
    let message = "";

    // Empty check
    if (!value) {
      valid = false;
      message = "This field is required";
    }

    // Name & surname
    if (valid && (type === "name" || type === "surname")) {
      if (!/^[A-Za-z]+$/.test(value)) {
        valid = false;
        message = "Only letters allowed";
      }
    }

    // Email
    if (valid && type === "email") {
      if (!/^\S+@\S+\.\S+$/.test(value)) {
        valid = false;
        message = "Invalid email format";
      }
    }

    // Address
    if (valid && type === "address") {
      if (value.length < 5) {
        valid = false;
        message = "Address is too short";
      }
    }

    // Rating
    if (valid && type === "rating") {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 10) {
        valid = false;
        message = "Value must be between 0 and 10";
      }
    }

    // Phone (GLOBAL)
    if (valid && type === "phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 7) {
        valid = false;
        message = "Phone number is too short";
      }
    }

    input.classList.toggle("is-valid", valid);
    input.classList.toggle("is-invalid", !valid);
    input.nextElementSibling.textContent = message;

    return valid;
  }

  function checkFormValidity() {
    const allValid = [...inputs].every(validateInput);
    submitBtn.disabled = !allValid;
  }

  inputs.forEach(input => {
    input.addEventListener("input", () => {
      validateInput(input);
      checkFormValidity();
    });
  });

  /* ======================
     GLOBAL PHONE MASKING
  ====================== */

  const phoneInput = document.getElementById("phone");

  phoneInput.addEventListener("input", e => {
    let digits = e.target.value.replace(/\D/g, "");

    // International max length
    digits = digits.slice(0, 15);

    let formatted = "+";
    if (digits.length > 0) formatted += digits.slice(0, 3);
    if (digits.length > 3) formatted += " " + digits.slice(3, 6);
    if (digits.length > 6) formatted += " " + digits.slice(6, 9);
    if (digits.length > 9) formatted += " " + digits.slice(9, 13);

    e.target.value = formatted.trim();
  });

  /* ======================
     SUBMIT HANDLER
  ====================== */

  form.addEventListener("submit", e => {
    e.preventDefault();

    const data = {
      name: firstName.value,
      surname: surname.value,
      email: email.value,
      phone: phone.value,
      address: address.value,
      ratings: [
        Number(rating1.value),
        Number(rating2.value),
        Number(rating3.value)
      ]
    };

    console.log(data);

    const avg =
      data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length;

    let avgClass =
      avg < 4 ? "avg-red" : avg < 7 ? "avg-orange" : "avg-green";

    resultBox.innerHTML = `
      <p>Name: ${data.name}</p>
      <p>Surname: ${data.surname}</p>
      <p>Email: ${data.email}</p>
      <p>Phone number: ${data.phone}</p>
      <p>Address: ${data.address}</p>
      <p class="${avgClass}">
        ${data.name} ${data.surname}: ${avg.toFixed(1)}
      </p>
    `;

    const popup = document.createElement("div");
    popup.className = "success-popup";
    popup.textContent = "Form submitted successfully!";
    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 3000);
  });

});
