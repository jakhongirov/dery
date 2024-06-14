const model = require('../../model')
const { bot } = require('./bot')

const formatNumber = (number) => {
   return new Intl.NumberFormat('en-US', { useGrouping: true }).format(number).replace(/,/g, ' ');
}

const checkBirthdays = async () => {
   const today = new Date();
   const day = String(today.getDate()).padStart(2, '0');
   const month = String(today.getMonth() + 1).padStart(2, '0');
   const todayString = `${day}.${month}`;
   const foundRelationship = await model.foundRelationship(todayString)

   if (foundRelationship?.length > 0) {
      foundRelationship.forEach(e => {
         if (e.user_lang == "uz") {
            bot.sendMessage(e.user_chat_id, `Bugun ${e?.relationship_name}ning tavallud ayyomlari🎉`)
         } else if (e.user_lang == "ru") {
            bot.sendMessage(e.user_chat_id, `Сегодня день рождения ${e?.relationship_name}🎉`)
         }
      });
   }
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

module.exports = {
   formatNumber,
   checkBirthdays,
   calculateAge
}