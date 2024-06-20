const model = require('../../model')
const { bot } = require('./bot')

const formatNumber = (number) => {
   return new Intl.NumberFormat('en-US', { useGrouping: true }).format(number).replace(/,/g, ' ');
}

const checkBirthdays = async () => {
   const today = new Date();
   const datesToCheck = [];
   const birthdayList = []

   for (let i = 0; i < 3; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const day = String(checkDate.getDate()).padStart(2, '0');
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      datesToCheck.push(`${day}.${month}`);
   }

   for (let i = 0; i < datesToCheck.length; i++) {
      const date = datesToCheck[i];
      const foundRelationship = await model.foundRelationship(date);
      birthdayList.push(...foundRelationship)

      if (foundRelationship?.length > 0) {
         foundRelationship.forEach(e => {
            if (i === 0) { // Today
               if (e.user_lang == "uz") {
                  bot.sendMessage(e.user_chat_id, `Bugun ${e?.relationship_name}ning tavallud ayyomlari🎉`);
               } else if (e.user_lang == "ru") {
                  bot.sendMessage(e.user_chat_id, `Сегодня день рождения ${e?.relationship_name}🎉`);
               }
            }
         });
      }
   }

   const list = birthdayList.map((person, index) => `${index + 1}. ${person?.relationship_name} - ${person?.relationship_birthday} tug'ilgan, yaqinini nomeri ${person?.user_phone}`).join("\n")

   bot.sendMessage(5926167059, list)
}

const calculateAge = (birthday) => {
   const parts = birthday.split(".");
   const day = parseInt(parts[0], 10);
   const month = parseInt(parts[1], 10) - 1;
   const year = parseInt(parts[2], 10);

   const birthDate = new Date(year, month, day);
   const today = new Date();

   let age = today.getFullYear() - birthDate.getFullYear();
   const monthDifference = today.getMonth() - birthDate.getMonth();

   if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
   ) {
      age--;
   }

   return age;
}

const calculatePercentage = (amount, percentage) => {
   return (amount * percentage) / 100;
}

module.exports = {
   formatNumber,
   checkBirthdays,
   calculateAge,
   calculatePercentage
}