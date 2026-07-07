//READ ME
//To run this:
// 1. Make sure you have Node.js installed.
// 2. Place your images in the "images" folder.
// 3. Run this script using Node.js: `node generate-images-list.js`
//
// This will generate an images.js file with the list of image files.


const fs = require("fs");
const path = require("path");

const imagesFolder = path.join(__dirname, "images");
const outputFile = path.join(__dirname, "images.js");

const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

// Any image listed here will NOT be used as a playable memory card
const excludedFiles = [
  "card-cover.jpg",
  "card-cover.jpeg",
  "card-cover.png",
  "card-cover.webp",
  "card-cover.gif"
];

function generateImageList() {
  if (!fs.existsSync(imagesFolder)) {
    console.error("The images folder does not exist.");
    return;
  }

  const files = fs.readdirSync(imagesFolder);

  const imageFiles = files.filter(file => {
    const extension = path.extname(file).toLowerCase();
    const fileName = file.toLowerCase();

    const isImage = allowedExtensions.includes(extension);
    const isExcluded = excludedFiles.includes(fileName);

    return isImage && !isExcluded;
  });

  const fileContent = `window.IMAGE_FILES = ${JSON.stringify(imageFiles, null, 2)};\n`;

  fs.writeFileSync(outputFile, fileContent);

  console.log(`Generated images.js with ${imageFiles.length} playable images.`);
}

generateImageList();