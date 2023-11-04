const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseURL = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseURL, supabaseKey);

const websites = [
  "https://www.edogs.de/magazin/hunderassen/kleine-hunde/",
  "https://www.edogs.de/magazin/hunderassen/mittelgrosse-hunde/",
  "https://www.edogs.de/magazin/hunderassen/grosse-hunde/",
];

little_dogs = [];
middle_dogs = [];
big_dogs = [];

try {
  for (let i = 0; i < websites.length; i++) {
    axios(websites[i]).then((response) => {
      const data = response.data;
      const $ = cheerio.load(data);
      const links = [];

      $("li.penci-featured-ct a", data).each(function () {
        const href = $(this).attr("href");
        links.push(href);
      });

      links.forEach(async (link) => {
        await axios(link).then((res) => {
          const webData = res.data;
          const $ = cheerio.load(webData);

          let facts = [];
          $("td:not(.rowHead):not(.rowTitle)")
            .slice(0, 10)
            .each(function () {
              const fact = $(this).text();
              facts.push(fact);
            });
          const name = $("h1.post-title").text();
          const img = $("span.penci-single-featured-img", webData).data("bg");

          const dogObj = {
            name: name,
            img: img,
            size: facts[0],
            weight: facts[1],
            fci_group: facts[2],
            section: facts[3],
            origin_country: facts[4],
            color: facts[5],
            lifespan: facts[6],
            role: facts[7],
            sports: facts[8],
            character: facts[9],
          };
          if (i === 0) {
            dogObj.category = "kleine Hunde";
            little_dogs.push(dogObj);
            fs.writeFileSync(
              "little_dogs.json",
              JSON.stringify(little_dogs, null, 2)
            );
          } else if (i === 1) {
            dogObj.category = "mittelgroße Hunde";
            middle_dogs.push(dogObj);
            fs.writeFileSync(
              "middle_dogs.json",
              JSON.stringify(middle_dogs, null, 2)
            );
          } else if (i === 2) {
            dogObj.category = "große Hunde";
            big_dogs.push(dogObj);
            fs.writeFileSync(
              "big_dogs.json",
              JSON.stringify(big_dogs, null, 2)
            );
          }
        });
      });
    });
  }
} catch (error) {
  console.log(error, error.message);
}
