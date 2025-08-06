// Background carousel functionality
let currentSlide = 0;
const slides = document.querySelectorAll(".bg-slide");
const totalSlides = slides.length;

function nextSlide() {
    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + 1) % totalSlides;
    slides[currentSlide].classList.add("active");
}

// Change background every 5 seconds
setInterval(nextSlide, 5000);

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    });
});

// Add scroll-triggered animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

// Observe about cards for animation
document.querySelectorAll(".about-card").forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(card);
});

// Enhanced carousel with scroll-based transitions
function updateCarouselBasedOnScroll() {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Calculate which image should be active based on scroll position
    const scrollPercentage = scrollTop / (documentHeight - windowHeight);
    const targetSlide = Math.floor(scrollPercentage * totalSlides);

    if (
        targetSlide !== currentSlide &&
        targetSlide >= 0 &&
        targetSlide < totalSlides
    ) {
        slides[currentSlide].classList.remove("active");
        currentSlide = targetSlide;
        slides[currentSlide].classList.add("active");
    }
}

// Listen to scroll for dynamic background changes
let scrollTimeout;
window.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateCarouselBasedOnScroll, 100);

    // Parallax effect
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.3;
    document.querySelector(
        ".background-carousel"
    ).style.transform = `translateY(${rate}px)`;
});

// Image Upload Functionality
const uploadArea = document.getElementById("uploadArea");
const imageInput = document.getElementById("imageInput");
const uploadedImages = document.getElementById("uploadedImages");
const predictBtn = document.getElementById("predictBtn");
const resultsSection = document.getElementById("resultsSection");
const resultsGrid = document.getElementById("resultsGrid");

let selectedFiles = [];

// Upload area click handler
uploadArea.addEventListener("click", () => {
    imageInput.click();
});

// Prevent default drag behaviors
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area when item is dragged over it
["dragenter", "dragover"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, highlight, false);
});

["dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    uploadArea.classList.add("dragover");
}

function unhighlight(e) {
    uploadArea.classList.remove("dragover");
}

// Handle dropped files
uploadArea.addEventListener("drop", handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Handle selected files
imageInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    [...files].forEach(addFile);
}

function addFile(file) {
    if (!file.type.startsWith("image/")) {
        alert("Please select only image files.");
        return;
    }

    selectedFiles.push(file);
    displayUploadedImage(file);
    updatePredictButton();
}

function displayUploadedImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const imageDiv = document.createElement("div");
        imageDiv.className = "uploaded-image";
        imageDiv.innerHTML = `
                    <img src="${e.target.result}" alt="Uploaded galaxy">
                    <button class="remove-image" onclick="removeImage(this, '${file.name}')">×</button>
                `;
        uploadedImages.appendChild(imageDiv);
    };
    reader.readAsDataURL(file);
}

function removeImage(button, fileName) {
    const imageDiv = button.parentElement;
    imageDiv.remove();
    selectedFiles = selectedFiles.filter((file) => file.name !== fileName);
    updatePredictButton();
}

function updatePredictButton() {
    predictBtn.disabled = selectedFiles.length === 0;
}

// Prediction functionality
predictBtn.addEventListener("click", async () => {
    if (selectedFiles.length === 0) return;

    // Show loading state
    const btnText = predictBtn.querySelector(".btn-text");
    const btnLoader = predictBtn.querySelector(".btn-loader");
    btnText.hidden = true;
    btnLoader.hidden = false;
    predictBtn.disabled = true;

    try {
        // Prepare form data
        const formData = new FormData();
        selectedFiles.forEach((file, index) => {
            formData.append(`images`, file);
        });

        // Send to backend (replace with your actual endpoint)
        const response = await fetch("/predict", {
            method: "POST",
            body: formData,
        });

        console.log('response status: ', response.status)

        if (!response.ok) {
            throw new Error("Prediction failed");
        }

        const results = await response.json();
        displayResults(results);
    } catch (error) {
        console.error("Error:", error);
        alert("Prediction failed. Please try again.");
    } finally {
        // Reset button state
        btnText.hidden = false;
        btnLoader.hidden = true;
        predictBtn.disabled = false;
    }
});

function displayResults(results) {
    resultsGrid.innerHTML = "";

    results.forEach((result, index) => {
        const resultCard = document.createElement("div");
        resultCard.className = "result-card";

        const confidence = Math.round(result.confidence * 100);

        resultCard.innerHTML = `
                    <div class="result-image">
                        <img src="data:image/jpeg;base64,${result.image_base64}" alt="Galaxy prediction">
                    </div>
                    <div class="result-info">
                        <div class="result-class">${result.predicted_class}</div>
                        <div class="result-confidence">Confidence: ${confidence}%</div>
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${confidence}%"></div>
                        </div>
                    </div>
                `;

        resultsGrid.appendChild(resultCard);
    });

    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}