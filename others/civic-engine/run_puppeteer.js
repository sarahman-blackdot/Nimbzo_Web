const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(404);
            res.end('Not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(0, async () => {
    const port = server.address().port;
    const url = `http://localhost:${port}/index.html`;
    
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        
        page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
        page.on('pageerror', err => console.log(`[Browser Error]: ${err.toString()}`));

        await page.goto(url, { waitUntil: 'networkidle0' });

        const readDOM = async (label) => {
            console.log(`\n--- ${label} ---`);
            const data = await page.evaluate(() => {
                const text = (id) => document.getElementById(id)?.textContent || 'N/A';
                return {
                    year: text('year-display'),
                    humanScore: text('human-output-score'),
                    treasury: text('val-treasury'),
                    taxRate: text('val-tax-rate'),
                    hcCap: text('val-hc-cap'),
                    eduCap: text('val-edu-cap'),
                    infraQual: text('val-infra-qual'),
                    hcOut: text('val-hc-out'),
                    ruleOfLaw: text('val-rule-of-law'),
                    oversightIndep: text('val-oversight-indep'),
                    electionInt: text('val-election-int'),
                    econVitality: text('val-econ-vitality'),
                    infraServ: text('val-infra-serv'),
                    stressIndex: text('val-stress-index'),
                    brainDrain: text('val-brain-drain')
                };
            });
            for (const [k, v] of Object.entries(data)) {
                console.log(`${k}: ${v}`);
            }
        };

        await readDOM('Initial Load');

        await page.click('#advance-btn');
        await readDOM('After 1st Click');

        await page.click('#advance-btn');
        await readDOM('After 2nd Click');

        await browser.close();
    } catch (err) {
        console.error("Puppeteer error:", err);
    } finally {
        server.close();
    }
});
