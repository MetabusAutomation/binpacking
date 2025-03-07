// Rectangle class to store rectangle properties
class Rectangle {
    /**
     * @param {string} name - The name of the rectangle
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width of the rectangle
     * @param {number} height - Height of the rectangle
     * @param {string} color - Color of the rectangle
     */
    constructor(name, x, y, width, height, color) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
}

// Canvas manager class to handle all drawing operations
class CanvasManager {
    /**
     * @param {string} canvasId - The ID of the canvas element
     */
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.rectangles = [];
        this.sheetsList = []; // List to store sheets before adding to canvas

        // Scale factor (how many pixels per inch for display)
        this.scale = 20; // 20px = 1 inch for display purposes

        // Global parameters (in inches)
        this.logicalWidth = 60; // Default width in inches (5ft)
        this.maxSectionLength = 96; // Default max section length in inches (8ft)
        this.canvasHeight = 96; // Default canvas height in inches (8ft)

        this.setupCanvas();

        // Resize canvas when window resizes
        window.addEventListener('resize', () => this.setupCanvas());
    }

    /**
     * Setup canvas dimensions and scaling
     */
    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();

        // Set display width based on container
        this.canvas.style.width = rect.width + 'px';

        // Convert logical inches to pixels for the canvas
        this.canvas.width = this.logicalWidth * this.scale;
        this.canvas.height = this.canvasHeight * this.scale;

        this.redraw();
    }

    /**
     * Update global parameters
     * @param {number} logicalWidth - The logical width in inches
     * @param {number} maxSectionLength - The maximum section length in inches
     */
    updateParams(logicalWidth, maxSectionLength) {
        this.logicalWidth = logicalWidth;
        this.maxSectionLength = maxSectionLength;

        // Update canvas height based on content
        this.canvasHeight = Math.max(96, this.calculateRequiredHeight());

        this.setupCanvas();
    }

    /**
     * Calculate required canvas height based on rectangles
     * @returns {number} The required canvas height in inches
     */
    calculateRequiredHeight() {
        if (this.rectangles.length === 0) return this.maxSectionLength;

        // Find the tallest rectangle (since they're all at y=0)
        const tallestRectangle = Math.max(...this.rectangles.map(r => r.height));

        // Find the bottom-most point of any rectangle (in inches)
        const maxBottom = Math.max(...this.rectangles.map(r => r.y + r.height));

        // Ensure we have at least enough height for the tallest rectangle
        // or any rectangle that might be positioned lower
        return Math.max(tallestRectangle, maxBottom + 6, this.maxSectionLength);
    }

    /**
     * Add a new rectangle to the canvas
     * @param {Rectangle} rect - The rectangle to add
     */
    addRectangle(rect) {
        this.rectangles.push(rect);

        // Update canvas height if needed
        this.canvasHeight = Math.max(this.canvasHeight, this.calculateRequiredHeight());
        this.setupCanvas();
    }

    /**
     * Clear all rectangles from the canvas
     */
    clearRectangles() {
        this.rectangles = [];
        this.redraw();
    }

    /**
     * Draw a single rectangle with labels
     * @param {Rectangle} rect - The rectangle to draw
     */
    drawRectangle(rect) {
        const { x, y, width, height, color, name } = rect;

        // Convert inches to pixels for drawing
        const pixelX = x * this.scale;
        const pixelY = y * this.scale;
        const pixelWidth = width * this.scale;
        const pixelHeight = height * this.scale;

        // Draw rectangle
        this.ctx.fillStyle = color;
        this.ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);

        // Draw border
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(pixelX, pixelY, pixelWidth, pixelHeight);

        // Draw labels
        this.ctx.fillStyle = 'black';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';

        // Draw name in center
        this.ctx.fillText(name, pixelX + pixelWidth / 2, pixelY + pixelHeight / 2);

        // Draw dimensions at bottom (in inches)
        this.ctx.fillText(`${width}" × ${height}"`, pixelX + pixelWidth / 2, pixelY + pixelHeight - 10);
    }

    /**
     * Redraw all rectangles
     */
    redraw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw inch grid for reference
        this.drawGrid();

        // Draw canvas boundary for reference
        this.ctx.strokeStyle = '#0a0';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, 0, this.logicalWidth * this.scale, this.canvasHeight * this.scale);

        // Draw section lines
        if (this.sectionLines && this.sectionLines.length > 0) {
            this.ctx.setLineDash([20, 10]); // Dashed line pattern
            this.ctx.strokeStyle = '#f00';
            this.ctx.lineWidth = 2;

            this.sectionLines.forEach(y => {
                const pixelY = y * this.scale;
                this.ctx.beginPath();
                this.ctx.moveTo(0, pixelY);
                this.ctx.lineTo(this.logicalWidth * this.scale, pixelY);
                this.ctx.stroke();

                // Add "CUT LINE" text
                this.ctx.fillStyle = '#f00';
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText("CUT LINE", this.logicalWidth * this.scale / 2, pixelY - 5);
            });

            // Reset line style
            this.ctx.setLineDash([]);
        }

        // Draw each rectangle
        this.rectangles.forEach(rect => this.drawRectangle(rect));
    }

    /**
     * Draw a grid showing inch divisions
     */
    drawGrid() {
        const gridSize = this.scale; // 1 inch grid

        this.ctx.strokeStyle = '#eee';
        this.ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        // Label major divisions (every 12 inches = 1 foot)
        this.ctx.fillStyle = '#999';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';

        for (let x = 0; x <= this.logicalWidth; x += 12) {
            this.ctx.fillText(`${x}"`, x * this.scale + 5, 15);
        }

        this.ctx.textAlign = 'right';
        for (let y = 0; y <= this.canvasHeight; y += 12) {
            this.ctx.fillText(`${y}"`, 20, y * this.scale + 15);
        }
    }

    /**
     * Generate a random color
     * @returns {string} A random RGB color
     */
    static randomColor() {
        const r = Math.floor(Math.random() * 200) + 55;
        const g = Math.floor(Math.random() * 200) + 55;
        const b = Math.floor(Math.random() * 200) + 55;
        return `rgba(${r}, ${g}, ${b}, 0.7)`;
    }

    /**
     * Find a suitable position for a new rectangle
     * Currently just places at (0,0) or below the lowest rectangle
     * This can be replaced with more complex logic later
     * @param {number} width - Width of the rectangle
     * @param {number} height - Height of the rectangle
     * @returns {Object} x and y coordinates
     */
    findPosition(width, height) {
        if (this.rectangles.length === 0) {
            return { x: 0, y: 0 };
        }

        // Simple positioning: put below the lowest rectangle
        const maxBottom = Math.max(...this.rectangles.map(r => r.y + r.height));
        return { x: 0, y: maxBottom + 20 };
    }

    /**
     * Checks if a sheet can fit within the current constraints
     * @param {number} width - Width of the sheet in inches
     * @param {number} height - Height of the sheet in inches
     * @returns {Object} { canFit: boolean, message: string }
     */
    checkSheetFits(width, height) {
        // Check if sheet dimensions are within constraints (considering rotation)
        const minDimension = Math.min(width, height);
        const maxDimension = Math.max(width, height);

        // If the smaller dimension exceeds canvas width, it can't fit
        if (minDimension > this.logicalWidth) {
            return {
                canFit: false,
                message: `Sheet is too large! Both dimensions (${width}" × ${height}") exceed canvas width of ${this.logicalWidth}".`
            };
        }

        // If larger dimension exceeds canvas width AND max section length, it can't fit
        if (maxDimension > this.logicalWidth && maxDimension > this.maxSectionLength) {
            return {
                canFit: false,
                message: `Sheet is too large! The dimension of ${maxDimension}" exceeds both canvas width (${this.logicalWidth}") and max section length (${this.maxSectionLength}").`
            };
        }

        return { canFit: true };
    }

    /**
     * Add a sheet to the list (not yet on canvas)
     * @param {Object} sheet - The sheet to add to the list
     * @returns {boolean} Whether the sheet was successfully added
     */
    addSheetToList(sheet) {
        // Check if sheet can fit within constraints
        const fitCheck = this.checkSheetFits(sheet.width, sheet.height);

        if (!fitCheck.canFit) {
            this.showErrorMessage(fitCheck.message);
            return false;
        }

        this.sheetsList.push(sheet);
        this.updateSheetListUI();
        return true;
    }

    /**
     * Shows an error message to the user
     * @param {string} message - The error message to display
     */
    showErrorMessage(message) {
        // Create error message element
        const errorContainer = document.getElementById('errorContainer') || this.createErrorContainer();
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    }

    /**
     * Creates an error container if it doesn't exist
     * @returns {HTMLElement} The error container element
     */
    createErrorContainer() {
        const container = document.createElement('div');
        container.id = 'errorContainer';
        container.className = 'error-container';

        // Insert after the header but before the canvas
        const header = document.querySelector('h1');
        header.parentNode.insertBefore(container, header.nextSibling);

        return container;
    }

    /**
     * Remove a sheet from the list by index
     * @param {number} index - The index of the sheet to remove
     */
    removeSheetFromList(index) {
        if (index >= 0 && index < this.sheetsList.length) {
            this.sheetsList.splice(index, 1);
            this.updateSheetListUI();
        }
    }

    /**
     * Update the UI with the current sheet list
     */
    updateSheetListUI() {
        const listElement = document.getElementById('sheetsList');
        listElement.innerHTML = '';

        if (this.sheetsList.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-list';
            emptyDiv.textContent = 'No sheets added yet';
            listElement.appendChild(emptyDiv);
            return;
        }

        this.sheetsList.forEach((sheet, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'sheet-item';

            const infoDiv = document.createElement('div');
            infoDiv.className = 'sheet-info';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'sheet-name';
            nameDiv.textContent = sheet.name;

            const dimensionsDiv = document.createElement('div');
            dimensionsDiv.className = 'sheet-dimensions';
            dimensionsDiv.textContent = `${sheet.width}" × ${sheet.height}"`;

            infoDiv.appendChild(nameDiv);
            infoDiv.appendChild(dimensionsDiv);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-sheet';
            deleteButton.textContent = 'X';
            deleteButton.addEventListener('click', () => this.removeSheetFromList(index));

            itemDiv.appendChild(infoDiv);
            itemDiv.appendChild(deleteButton);

            listElement.appendChild(itemDiv);
        });
    }

    /**
     * Place all sheets on the canvas using the skyline packing algorithm
     */
    placeAllSheets() {
        if (this.sheetsList.length === 0) return;

        // Reset rectangles and section lines
        this.rectangles = [];
        this.sectionLines = [];

        // Prepare sheets with smarter rotation and better sorting
        const preparedSheets = this.sheetsList.map(sheet => {
            // For rectangles that are significantly taller than wide,
            // rotate to make better use of width
            if (sheet.height > 1.5 * sheet.width && sheet.height > this.logicalWidth * 0.3) {
                return {
                    ...sheet,
                    width: sheet.height,
                    height: sheet.width,
                    wasRotated: true
                };
            }
            return { ...sheet, wasRotated: false };
        });

        // Sort with a strategy that improves width utilization:
        // 1. First by width (widest first)
        // 2. Then by area as a tiebreaker
        const sortedSheets = preparedSheets.sort((a, b) => {
            // First sort by width (wider rectangles first)
            if (Math.abs(a.width - b.width) > 1) {
                return b.width - a.width;
            }

            // If widths are similar, sort by area
            const areaA = a.width * a.height;
            const areaB = b.width * b.height;
            return areaB - areaA;
        });

        // Run the skyline packing algorithm
        const result = skylineSectionPack(this.logicalWidth, this.maxSectionLength, sortedSheets);

        // Create rectangles from the placement results
        result.placements.forEach(placement => {
            const sheet = sortedSheets[placement.index];
            const rect = new Rectangle(
                sheet.name,
                placement.x,
                placement.y,
                placement.width,
                placement.height,
                sheet.color
            );
            this.addRectangle(rect);
        });

        // Set section boundaries (excluding the first one which is always 0)
        if (result.sectionBoundaries.length > 1) {
            // Add section lines between sections (not at the very end)
            for (let i = 0; i < result.sectionBoundaries.length - 1; i++) {
                this.sectionLines.push(result.sectionBoundaries[i]);
            }
        }

        // Update canvas height to fit all sections
        this.canvasHeight = Math.max(this.canvasHeight, result.totalHeight + 10); // Add padding
        this.setupCanvas();
        this.redraw();
    }

    /**
     * Clear both the canvas and the sheet list
     */
    clearAll() {
        this.rectangles = [];
        this.sheetsList = [];
        this.updateSheetListUI();
        this.redraw();
    }

    /**
     * Print the canvas
     */
    printCanvas() {
        // Create a new window
        const printWindow = window.open('', '_blank');

        // Create HTML content with just the canvas
        printWindow.document.write(`
            <html>
            <head>
                <title>Rectangle Packing Print</title>
                <style>
                    @media print {
                        body { margin: 0; }
                        canvas { 
                            max-width: 100%; 
                            height: auto; 
                            page-break-inside: avoid;
                        }
                    }
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        margin: 0;
                        padding: 20px;
                    }
                    .print-container {
                        display: inline-block;
                        position: relative;
                    }
                    .print-info {
                        text-align: center;
                        font-family: Arial, sans-serif;
                        margin-bottom: 10px;
                    }
                    canvas {
                        border: 1px solid #ccc;
                        box-shadow: 0 0 5px rgba(0,0,0,0.2);
                    }
                    .print-btn {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        padding: 5px 10px;
                        background: #4a148c;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    @media print {
                        .print-btn {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    <div class="print-info">
                        <h2>Rectangle Packing Layout</h2>
                        <p>Width: ${this.logicalWidth}" × Height: ${this.canvasHeight}"</p>
                    </div>
                    <button class="print-btn" onclick="window.print(); window.close();">Print</button>
                </div>
            </body>
            </html>
        `);

        // Get the container in the new window
        const container = printWindow.document.querySelector('.print-container');

        // Create a new canvas in the print window
        const printCanvas = document.createElement('canvas');
        printCanvas.width = this.canvas.width;
        printCanvas.height = this.canvas.height;

        // Copy the current canvas content to the new canvas
        const ctx = printCanvas.getContext('2d');
        ctx.drawImage(this.canvas, 0, 0);

        // Add the canvas to the print window
        container.appendChild(printCanvas);

        // Focus the print window
        printWindow.focus();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvasManager = new CanvasManager('rectCanvas');

    // Add sheet to list
    document.getElementById('addSheet').addEventListener('click', () => {
        const name = document.getElementById('rectName').value || 'Sheet';
        const width = parseFloat(document.getElementById('rectWidth').value) || 10;
        const height = parseFloat(document.getElementById('rectHeight').value) || 5;

        // Create the sheet object
        const sheet = {
            name,
            width,
            height,
            color: CanvasManager.randomColor()
        };

        // Only clear input if successfully added
        if (canvasManager.addSheetToList(sheet)) {
            // Clear input fields
            document.getElementById('rectName').value = '';
        }
    });

    // Place all sheets on canvas
    document.getElementById('placeSheets').addEventListener('click', () => {
        canvasManager.placeAllSheets();
    });

    // Apply global parameters
    document.getElementById('applyParams').addEventListener('click', () => {
        const logicalWidth = parseFloat(document.getElementById('canvasWidth').value) || 60;
        const maxSectionLength = parseFloat(document.getElementById('maxSectionLength').value) || 96;

        canvasManager.updateParams(logicalWidth, maxSectionLength);
    });

    // Clear everything button
    document.getElementById('clearCanvas').addEventListener('click', () => {
        canvasManager.clearAll();
    });

    // Parse measurements
    document.getElementById('parseMeasurements').addEventListener('click', () => {
        const prefix = document.getElementById('namePrefix').value.trim();
        const bulkText = document.getElementById('bulkMeasurements').value;

        const sheets = parseBulkMeasurements(bulkText, prefix);

        if (sheets.length === 0) {
            canvasManager.showErrorMessage('No valid measurements found. Please check the format.');
            return;
        }

        // Add all valid sheets to the list
        let addedCount = 0;
        for (const sheet of sheets) {
            if (canvasManager.addSheetToList(sheet)) {
                addedCount++;
            }
        }

        if (addedCount > 0) {
            // Clear the textarea if at least one sheet was added
            document.getElementById('bulkMeasurements').value = '';

            // Show success message
            canvasManager.showErrorMessage(`Successfully added ${addedCount} sheets.`);
        }
    });

    // Print canvas button
    document.getElementById('printCanvas').addEventListener('click', () => {
        canvasManager.printCanvas();
    });
});

/**
 * Parse a measurement with possible fraction in format "X (Y/Z)"
 * @param {string} measurement - The measurement string to parse
 * @returns {number} The measurement in decimal inches
 */
function parseMeasurement(measurement) {
    // Trim any whitespace
    measurement = measurement.trim();

    // Regular expression to match patterns like "35 (3/4)" or just "35"
    const regex = /^(\d+(?:\.\d+)?)\s*(?:\((\d+)\/(\d+)\))?$/;
    const match = measurement.match(regex);

    if (!match) return 0;

    let result = parseFloat(match[1]);

    // Add fraction if present
    if (match[2] && match[3]) {
        const numerator = parseInt(match[2]);
        const denominator = parseInt(match[3]);
        if (denominator !== 0) {
            result += numerator / denominator;
        }
    }

    return result;
}

/**
 * Parse a line of text in format "height x width - description"
 * @param {string} line - The line to parse
 * @param {string} prefix - Prefix to add to the name
 * @returns {Object|null} Sheet object if valid, null if invalid
 */
function parseSheetLine(line, prefix) {
    line = line.trim();
    if (!line) return null;

    // Split into dimensions and description
    const parts = line.split('-');
    if (parts.length < 2) return null;

    const dimensions = parts[0].trim();
    const description = parts.slice(1).join('-').trim();

    // Split dimensions into height and width
    const dimensionParts = dimensions.split('x');
    if (dimensionParts.length !== 2) return null;

    const height = parseMeasurement(dimensionParts[0]);
    const width = parseMeasurement(dimensionParts[1]);

    // If either dimension is 0, parsing failed
    if (height === 0 || width === 0) return null;

    return {
        name: prefix ? `${prefix} - ${description}` : description,
        width,
        height,
        color: CanvasManager.randomColor()
    };
}

/**
 * Parse bulk measurements
 * @param {string} text - The multi-line text to parse
 * @param {string} prefix - Prefix to add to names
 * @returns {Array} Array of sheet objects
 */
function parseBulkMeasurements(text, prefix) {
    const lines = text.split('\n');
    const sheets = [];

    for (const line of lines) {
        const sheet = parseSheetLine(line, prefix);
        if (sheet) {
            sheets.push(sheet);
        }
    }

    return sheets;
}

/**
 * Merge adjacent skyline segments that share the same y value.
 * @param {Array<{x: number, y: number, width: number}>} skyline
 * @returns {Array<{x: number, y: number, width: number}>}
 */
function mergeSkyline(skyline) {
    if (!skyline.length) return skyline;
    skyline.sort((a, b) => a.x - b.x);
    const merged = [skyline[0]];
    for (let i = 1; i < skyline.length; i++) {
        const last = merged[merged.length - 1];
        const curr = skyline[i];
        // If segments are adjacent (or overlapping) and share the same y, merge them.
        if (last.y === curr.y && last.x + last.width >= curr.x) {
            last.width = Math.max(last.width, (curr.x - last.x) + curr.width);
        } else {
            merged.push(curr);
        }
    }
    return merged;
}

/**
 * Packs rectangles using a Skyline algorithm with long side vertical orientation.
 * 
 * @param {number} containerWidth - The fixed width of the container.
 * @param {number} sectionMaxHeight - The maximum height of one section.
 * @param {Array<{width: number, height: number, index: number}>} rectangles - The rectangles to pack.
 * @returns {object} An object with placements, section boundaries, and total height.
 */
function skylineSectionPack(containerWidth, sectionMaxHeight, rectangles) {
    const placements = [];
    const sectionBoundaries = [];

    // Start the first section at y = 0
    let currentSectionStart = 0;
    let currentSectionHeight = 0;

    // Initialize the skyline for the current section
    let skyline = [{ x: 0, y: currentSectionStart, width: containerWidth }];

    // Process rectangles in order
    for (let i = 0; i < rectangles.length; i++) {
        const rect = rectangles[i];

        // Determine orientation - always make longer side vertical
        let finalWidth, finalHeight, isRotated;
        if (rect.width > rect.height) {
            // If width is longer, rotate to make it vertical
            finalWidth = rect.height;
            finalHeight = rect.width;
            isRotated = true;
        } else {
            // If height is already longer or equal, keep as is
            finalWidth = rect.width;
            finalHeight = rect.height;
            isRotated = false;
        }

        // Skip if width exceeds container width
        if (finalWidth > containerWidth) {
            console.warn(`Rectangle ${rect.name || i} is too wide to fit in container`);
            continue;
        }

        let bestCandidate = null;
        let bestCandidateIndex = -1;
        let bestScore = Infinity;

        // Find the best position for this rectangle
        for (let j = 0; j < skyline.length; j++) {
            const candidate = skyline[j];
            if (candidate.width >= finalWidth) {
                // Calculate score prioritizing higher positions (lower y values)
                // Scale y value by 1000 to make it the dominant factor
                const heightScore = candidate.y * 1000;

                // Secondary factor: minimize wasted width
                const widthWasteScore = (candidate.width - finalWidth) * 0.1;

                const score = heightScore + widthWasteScore;

                // Would this position exceed section height?
                if (candidate.y + finalHeight > currentSectionStart + sectionMaxHeight) {
                    continue; // Skip this position
                }

                if (score < bestScore) {
                    bestScore = score;
                    bestCandidate = candidate;
                    bestCandidateIndex = j;
                }
            }
        }

        // If no candidate was found in current section, start a new section
        if (!bestCandidate) {
            // Mark the end of the current section
            const sectionEnd = currentSectionStart + currentSectionHeight;
            sectionBoundaries.push(sectionEnd);

            // Start a new section
            currentSectionStart = sectionEnd;
            currentSectionHeight = 0;
            skyline = [{ x: 0, y: currentSectionStart, width: containerWidth }];

            bestCandidate = skyline[0];
            bestCandidateIndex = 0;

            // Make sure this rectangle doesn't exceed section height
            if (finalHeight > sectionMaxHeight) {
                console.warn(`Rectangle ${rect.name || i} height (${finalHeight}) exceeds max section height (${sectionMaxHeight})`);
                continue; // Skip this rectangle
            }
        }

        // Place the rectangle at the chosen position
        const placement = {
            index: i,
            x: bestCandidate.x,
            y: bestCandidate.y,
            width: finalWidth,
            height: finalHeight,
            rotated: isRotated
        };
        placements.push(placement);

        // Update the current section height
        currentSectionHeight = Math.max(currentSectionHeight,
            (bestCandidate.y - currentSectionStart) + finalHeight);

        // Update the skyline
        const candidate = skyline.splice(bestCandidateIndex, 1)[0];

        // New segment for the top edge of the placed rectangle
        const newSegment = { x: candidate.x, y: candidate.y + finalHeight, width: finalWidth };

        // Segment for the remaining width (if any)
        const rightSegmentWidth = candidate.width - finalWidth;
        let rightSegment = rightSegmentWidth > 0
            ? { x: candidate.x + finalWidth, y: candidate.y, width: rightSegmentWidth }
            : null;

        // Insert new segments into the skyline
        skyline.splice(bestCandidateIndex, 0, newSegment);
        if (rightSegment) {
            skyline.splice(bestCandidateIndex + 1, 0, rightSegment);
        }

        // Merge adjacent segments with the same y value
        skyline = mergeSkyline(skyline);
    }

    // Add the final section boundary
    if (currentSectionHeight > 0) {
        sectionBoundaries.push(currentSectionStart + currentSectionHeight);
    }

    // Calculate total height
    const totalHeight = currentSectionStart + currentSectionHeight;

    return { placements, sectionBoundaries, totalHeight };
} 