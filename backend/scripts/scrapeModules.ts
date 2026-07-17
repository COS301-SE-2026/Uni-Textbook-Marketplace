import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';

puppeteer.use(StealthPlugin());

const facultyMapping: Record<string, string> = {
  'SCI': 'Natural and Agricultural Sciences',
  'EBIT': 'Engineering, Built Environment and IT',
  'EMS': 'Economic and Management Sciences',
  'EDU': 'Education',
  'HLT': 'Health Sciences',
  'HUM': 'Humanities',
  'LAW': 'Law',
  'THEO': 'Theology and Religion',
  'VET': 'Veterinary Sciences',
  'GIBS': 'Gordon Institute of Business Science'
};

const faculties = [
  {
    name: 'Natural and Agricultural Sciences',
    url: 'https://www.up.ac.za/yearbooks/2026/SCI-faculty/UG-modules',
  },
  {
    name: 'Engineering, Built Environment and IT',
    url: 'https://www.up.ac.za/yearbooks/2026/EBIT-faculty/UG-modules',
  },
  {
    name: 'Economic and Management Sciences',
    url: 'https://www.up.ac.za/yearbooks/2026/EMS-faculty/UG-modules',
  },
  {
    name: 'Health Sciences',
    url: 'https://www.up.ac.za/yearbooks/2026/MED-faculty/UG-modules',
  },
  {
    name: 'Humanities',
    url: 'https://www.up.ac.za/yearbooks/2026/HUM-faculty/UG-modules',
  },
  {
    name: 'Law',
    url: 'https://www.up.ac.za/yearbooks/2026/LAW-faculty/UG-modules',
  },
  {
    name: 'Theology and Religion',
    url: 'https://www.up.ac.za/yearbooks/2026/THEO-faculty/UG-modules',
  },
  {
    name: 'Veterinary Sciences',
    url: 'https://www.up.ac.za/yearbooks/2026/VET-faculty/UG-modules',
  },
  {
    name: 'Gordon Institute of Business Science',
    url: 'https://www.up.ac.za/yearbooks/2026/GIBS-faculty/UG-modules',
  }
];

async function scrapeModules() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
  );

  const allModules: any[] = [];

  try {
    for (let i = 0; i < faculties.length; i++) {
      const faculty = faculties[i];
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Scraping faculty ${i + 1}/${faculties.length}: ${faculty.name}`);
      console.log(`${faculty.url}`);
      console.log(`${'='.repeat(60)}`);

      await page.goto(faculty.url, {
        waitUntil: 'networkidle2',
      });

      // Detect total pages
      const paginationInfo = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'))
          .filter((a) => {
            const href = a.href;
            return href.includes('zpage') && 
                   !href.includes('facebook') && 
                   !href.includes('twitter') && 
                   !href.includes('linkedin') &&
                   !href.includes('whatsapp') &&
                   !href.includes('mailto:') &&
                   !href.includes('#nogo') &&
                   !href.includes('#menu') &&
                   !href.includes('#mm-');
          })
          .map((a) => ({
            text: a.textContent?.trim(),
            href: a.href,
          }));

        const pageNumbers = links
          .map(link => {
            const match = link.href.match(/zpage=(\d+)/);
            return match ? parseInt(match[1], 10) : null;
          })
          .filter((num): num is number => num !== null);

        return {
          links,
          maxPage: pageNumbers.length > 0 ? Math.max(...pageNumbers) : 3,
        };
      });

      console.log(`Detected ${paginationInfo.maxPage} total pages`);
      console.log('Pagination links:', paginationInfo.links);

      const maxPages = Math.min(paginationInfo.maxPage, 20); 

      for (let pageNumber = 1; pageNumber <= maxPages; pageNumber++) {
        const pageUrl = pageNumber === 1
          ? faculty.url
          : `${faculty.url}?zpage=${pageNumber}`;

        console.log(`\nScraping page ${pageNumber}/${maxPages}`);

        if (pageNumber > 1) {
          await page.goto(pageUrl, {
            waitUntil: 'networkidle2',
          });
        }

        const modules = await page.evaluate((facultyMapping, facultyName) => {
          return Array.from(
            document.querySelectorAll('a[href*="/UG-modules/view/"]'),
          )
            .map((a) => {
              const text = a.textContent?.trim() ?? '';
              const href = (a as HTMLAnchorElement).href;

              const match = text.match(/\(([A-Z]+)\s*(\d{3})\)$/);

              if (!match) {
                return null;
              }

              const code = `${match[1]}${match[2]}`;

              const facultyMatch = href.match(
                /yearbooks\/2026\/([^/]+)-faculty/i,
              );

              const facultyCode = facultyMatch?.[1] ?? '';
              const fullFaculty = facultyMapping[facultyCode] || facultyName;

              return {
                code,
                name: text
                  .replace(/\([A-Z]+\s*\d{3}\)$/, '')
                  .trim(),
                faculty: fullFaculty,
                facultyCode: facultyCode,
                url: href,
              };
            })
            .filter(Boolean);
        }, facultyMapping, faculty.name);

        console.log(`Found ${modules.length} modules on page ${pageNumber}`);
        allModules.push(...modules);

        
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Delay between faculties
      if (i < faculties.length - 1) {
        console.log(`\nWaiting 3 seconds before next faculty...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Deduplicate modules
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Total modules before deduplication: ${allModules.length}`);
    console.log(`${'='.repeat(60)}`);

    const uniqueModules = Array.from(
      new Map(
        allModules.map((module) => [module.code, module]),
      ).values(),
    );

    console.log(`Total unique modules: ${uniqueModules.length}`);

    // Save as JSON
    fs.writeFileSync(
      'modules-data.json',
      JSON.stringify(uniqueModules, null, 2),
    );
    console.log('Saved modules-data.json');

    // Save as CSV
    if (uniqueModules.length > 0) {
      const csvHeader = 'code,name,faculty,facultyCode,url\n';
      const csvRows = uniqueModules.map((m: any) => 
        `${m.code},"${m.name.replace(/"/g, '""')}",${m.faculty},${m.facultyCode},${m.url}`
      ).join('\n');
      fs.writeFileSync('modules-data.csv', csvHeader + csvRows);
      console.log('Saved modules-data.csv');
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Scraping complete! Total modules: ${uniqueModules.length}`);
    console.log(`${'='.repeat(60)}`);

  } catch (error) {
    console.error('Scraping failed:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

scrapeModules();