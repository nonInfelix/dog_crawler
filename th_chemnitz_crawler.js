const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseURL = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseURL, supabaseKey);

const website = "https://tierschutz-chemnitz.de/tiervermittlung/hunde/";

const links = [];

axios(website).then((res) => {
  const data = res.data;
  const $ = cheerio.load(data);

  $(".list-pets div.col a", data).each(function () {
    const href = $(this).attr("href");
    links.push(href);
  });

  links.forEach(async (link) => {
    await axios(link).then(async (res) => {
      const data = res.data;
      const $ = cheerio.load(data);

      const name = $("h1.page-title").text().trim();
      const main_img = $(".content .page-content img.attachment-large").attr(
        "src"
      );
      const add_imgs = [];
      $("figure img").each(function (i, e) {
        add_imgs.push($(e).attr("src"));
      });
      const age = 99;
      let description = "";
      $(".page-content p").each(function (i, e) {
        description += $(e).text();
      });
      let main_description = description.replace(undefined, "");
      const health_status = $(`dt:contains('Gesundheitsstatus:')`)
        .next("dd")
        .text()
        .trim();
      const isActive = true;
      const shelter_id = "3f833b47-8089-4623-8c3e-64e002c67e8c";
      const dog_id = null;
      const gender = $("dl dd i").hasClass("icon-venus") ? "female" : "male";

      const dogObj = {
        name: name,
        main_img: main_img,
        add_imgs: add_imgs,
        age: age,
        description: main_description,
        health_status: health_status,
        isActive: isActive,
        shelter_id: shelter_id,
        dog_id: dog_id,
        gender: gender,
      };

      try {
        const { error } = await supabase.from("shelter_dogs").insert(dogObj);
        if (error) throw error;
      } catch (error) {
        console.error("Error: ", error.message);
      }
    });
  });
});
