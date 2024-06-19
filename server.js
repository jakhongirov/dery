require('dotenv').config()
const express = require("express");
const cors = require("cors");
const app = express();
const { PORT } = require("./src/config");
const router = require("./src/modules");
const fs = require('fs');
const path = require('path')
const QRCode = require('qrcode');
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const { bot } = require('./src/lib/bot')
const model = require('./model')
const { formatNumber, checkBirthdays, calculateAge } = require('./src/lib/functions');

const publicFolderPath = path.join(__dirname, 'public');
const imagesFolderPath = path.join(publicFolderPath, 'images');

if (!fs.existsSync(publicFolderPath)) {
   fs.mkdirSync(publicFolderPath);
   console.log('Public folder created successfully.');
} else {
   console.log('Public folder already exists.');
}

if (!fs.existsSync(imagesFolderPath)) {
   fs.mkdirSync(imagesFolderPath);
   console.log('Images folder created successfully.');
} else {
   console.log('Images folder already exists within the public folder.');
}

cron.schedule('0 0 * * *', async () => {
   console.log('Running check every minute');
   checkBirthdays()
});

(async () => {
   await checkBirthdays();
})();

// START
bot.onText(/\/start/, async msg => {
   const chatId = msg.chat.id
   const content = `<strong>Assalomu alaykum Dery'ga xush kelibsiz😊</strong>\n\n<strong>Здравствуйте и добро пожаловать в Dery😊</strong>`;
   const foundUserByChatId = await model.foundUserByChatId(chatId)

   if (foundUserByChatId) {
      if (foundUserByChatId?.user_lang == 'uz') {
         bot.sendMessage(chatId, `${foundUserByChatId?.user_name}! Birgalikda buyurtma beramizmi? 😃`, {
            reply_markup: JSON.stringify({
               keyboard: [
                  [
                     {
                        text: "🛍 Buyurtma berish"
                     }
                  ],
                  [
                     {
                        text: "✍️ Fikr bildirish"
                     },
                     {
                        text: "💸 Jamg'arma"
                     }
                  ],
                  [
                     {
                        text: "ℹ️ Maʼlumot"
                     },
                     {
                        text: "⚙️ Sozlamalar"
                     }
                  ],
                  [
                     {
                        text: "👥 Yaqinlarim"
                     }
                  ]
               ],
               resize_keyboard: true
            })
         })
      } else if (foundUserByChatId?.user_lang == 'ru') {
         bot.sendMessage(chatId, `${foundUserByChatId?.user_name}! Оформим заказ вместе? 😃`, {
            reply_markup: JSON.stringify({
               keyboard: [
                  [
                     {
                        text: "🛍 Заказать"
                     }
                  ],
                  [
                     {
                        text: "✍️ Оставить отзыв"
                     },
                     {
                        text: "💸 Накопитель"
                     }
                  ],
                  [
                     {
                        text: "ℹ️ Информация"
                     },
                     {
                        text: "⚙️ Настройки"
                     }
                  ],
                  [
                     {
                        text: "👥 Мои близкие"
                     }
                  ]
               ],
               resize_keyboard: true
            })
         })
      }
   } else {
      bot.sendMessage(chatId, content, {
         parse_mode: "HTML",
         reply_markup: {
            inline_keyboard: [
               [
                  {
                     text: "Uzbek 🇺🇿",
                     callback_data: "uz",
                  },
                  {
                     text: "Русский 🇷🇺",
                     callback_data: "ru",
                  },
               ]
            ]
         }
      })
   }

})

// REGISTER
bot.on('callback_query', async msg => {
   const lang = msg.data
   const chatId = msg.message.chat.id
   const foundUserByChatId = await model.foundUserByChatId(chatId)
   let requestName;
   let requestGender;
   let requestContact;
   let requestDay;
   let requestAge;

   if (lang == 'uz') {
      if (foundUserByChatId) {
         const editUserLang = await model.editUserLang(foundUserByChatId?.user_id, lang)

         if (editUserLang) {
            bot.sendMessage(chatId, `${foundUserByChatId?.user_name}! Birgalikda buyurtma beramizmi? 😃`, {
               reply_markup: JSON.stringify({
                  keyboard: [
                     [
                        {
                           text: "🛍 Buyurtma berish"
                        }
                     ],
                     [
                        {
                           text: "✍️ Fikr bildirish"
                        },
                        {
                           text: "💸 Jamg'arma"
                        }
                     ],
                     [
                        {
                           text: "ℹ️ Maʼlumot"
                        },
                        {
                           text: "⚙️ Sozlamalar"
                        }
                     ],
                     [
                        {
                           text: "👥 Yaqinlarim"
                        }
                     ]
                  ],
                  resize_keyboard: true
               })
            })
         }

      } else {
         bot.sendMessage(chatId, 'Ismingizni yozing', {
            reply_markup: {
               force_reply: true
            }
         }).then(payload => {
            const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, msg => {
               bot.removeListener(replyListenerId)

               if (msg.text) {
                  requestName = msg.text

                  bot.sendMessage(msg.chat.id, `🎂 ${requestName}, tavallud kuningiz bilan qachon tabriklashimiz mumkin? Sanani ss.oo.yyyy ko'rinishda kiriting.`, {
                     reply_markup: {
                        force_reply: true
                     }
                  }).then(payload => {
                     const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, msg => {
                        bot.removeListener(replyListenerId)

                        if (msg.text) {
                           requestDay = msg.text
                           requestAge = calculateAge(msg.text)

                           bot.sendMessage(msg.chat.id, `${requestName}, jinsni tanlang`, {
                              reply_markup: JSON.stringify({
                                 keyboard:
                                    [
                                       [
                                          {
                                             text: 'Erkak',
                                             force_reply: true
                                          },
                                          {
                                             text: 'Ayol',
                                             force_reply: true
                                          }
                                       ]
                                    ],
                                 resize_keyboard: true
                              })
                           }).then(payload => {
                              const replyListenerId = bot.on('message', msg => {
                                 bot.removeListener(replyListenerId)

                                 if (msg.text) {
                                    requestGender = msg.text

                                    bot.sendMessage(msg.chat.id, `${requestName}, Kontaktingizni yuboring`, {
                                       reply_markup: JSON.stringify({
                                          keyboard:
                                             [
                                                [
                                                   {
                                                      text: 'Kontaktni yuborish',
                                                      request_contact: true,
                                                      one_time_keyboard: true
                                                   }
                                                ]
                                             ],
                                          resize_keyboard: true
                                       })
                                    }).then(payload => {
                                       const replyListenerId = bot.on("contact", async (msg) => {
                                          bot.removeListener(replyListenerId)

                                          if (msg.contact) {
                                             requestContact = msg.contact.phone_number;
                                             const personal_code = uuidv4();
                                             const referral_code = uuidv4();

                                             if (requestName && requestGender && requestContact && requestDay) {

                                                QRCode.toFile(`./public/images/qrcode_personal_${chatId}.png`, personal_code, {}, async (err) => {
                                                   if (err) throw err;
                                                })

                                                QRCode.toFile(`./public/images/qrcode_referral_${chatId}.png`, referral_code, {}, async (err) => {
                                                   if (err) throw err;
                                                })


                                                const registerUser = await model.registerUser(
                                                   requestName,
                                                   requestGender,
                                                   requestDay,
                                                   requestAge,
                                                   `+${requestContact}`,
                                                   chatId,
                                                   personal_code,
                                                   referral_code,
                                                   `${process.env.BACKEND_URL}/qrcode_personal_${chatId}.png`,
                                                   `qrcode_personal_${chatId}.png`,
                                                   `${process.env.BACKEND_URL}/qrcode_referral_${chatId}.png`,
                                                   `qrcode_referral_${chatId}.png`,
                                                   lang
                                                )

                                                if (registerUser) {
                                                   bot.sendMessage(chatId, `${requestName}, muvaffaqiyatli ro'yxatdan o'tdingiz.`, {
                                                      reply_markup: JSON.stringify({
                                                         keyboard: [
                                                            [
                                                               {
                                                                  text: "🛍 Buyurtma berish"
                                                               }
                                                            ],
                                                            [
                                                               {
                                                                  text: "✍️ Fikr bildirish"
                                                               },
                                                               {
                                                                  text: "💸 Jamg'arma"
                                                               }
                                                            ],
                                                            [
                                                               {
                                                                  text: "ℹ️ Maʼlumot"
                                                               },
                                                               {
                                                                  text: "⚙️ Sozlamalar"
                                                               }
                                                            ],
                                                            [
                                                               {
                                                                  text: "👥 Yaqinlarim"
                                                               }
                                                            ]
                                                         ],
                                                         resize_keyboard: true
                                                      })
                                                   })
                                                }
                                             }
                                          }
                                       })
                                    })
                                 }
                              })
                           })
                        }
                     })
                  })
               }
            })
         })
      }
   } else if (lang == 'ru') {
      if (foundUserByChatId) {
         const editUserLang = await model.editUserLang(foundUserByChatId?.user_id, lang)

         if (editUserLang) {
            bot.sendMessage(chatId, `${foundUserByChatId?.user_name}! Оформим заказ вместе? 😃`, {
               reply_markup: JSON.stringify({
                  keyboard: [
                     [
                        {
                           text: "🛍 Заказать"
                        }
                     ],
                     [
                        {
                           text: "✍️ Оставить отзыв"
                        },
                        {
                           text: "💸 Накопитель"
                        }
                     ],
                     [
                        {
                           text: "ℹ️ Информация"
                        },
                        {
                           text: "⚙️ Настройки"
                        }
                     ],
                     [
                        {
                           text: "👥 Мои близкие"
                        }
                     ]
                  ],
                  resize_keyboard: true
               })
            })
         }
      } else {
         bot.sendMessage(chatId, 'Напишите свое имя', {
            reply_markup: {
               force_reply: true
            }
         }).then(payload => {
            const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, msg => {
               bot.removeListener(replyListenerId)

               if (msg.text) {
                  requestName = msg.text

                  bot.sendMessage(msg.chat.id, `🎂 ${requestName}, когда мы можем поздравить тебя с днем ​​рождения? Введите дату в формате дд.мм.гггг`, {
                     reply_markup: {
                        force_reply: true
                     }
                  }).then(payload => {
                     const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, msg => {
                        bot.removeListener(replyListenerId)

                        if (msg.text) {
                           requestDay = msg.text
                           requestAge = calculateAge(msg.text)

                           bot.sendMessage(msg.chat.id, `${requestName}, выберите пол`, {
                              reply_markup: JSON.stringify({
                                 keyboard:
                                    [
                                       [
                                          {
                                             text: 'Мужской',
                                             force_reply: true
                                          },
                                          {
                                             text: 'Женщина',
                                             force_reply: true
                                          }
                                       ]
                                    ],
                                 resize_keyboard: true
                              })
                           }).then(payload => {
                              const replyListenerId = bot.on('message', msg => {
                                 bot.removeListener(replyListenerId)

                                 if (msg.text) {
                                    requestGender = msg.text

                                    bot.sendMessage(msg.chat.id, `${requestName}, Отправьте свой контакт`, {
                                       reply_markup: JSON.stringify({
                                          keyboard:
                                             [
                                                [
                                                   {
                                                      text: 'Отправить контакт',
                                                      request_contact: true,
                                                      one_time_keyboard: true
                                                   }
                                                ]
                                             ],
                                          resize_keyboard: true
                                       })
                                    }).then(payload => {
                                       const replyListenerId = bot.on("contact", async (msg) => {
                                          bot.removeListener(replyListenerId)

                                          if (msg.contact) {
                                             requestContact = msg.contact.phone_number;
                                             const personal_code = uuidv4();
                                             const referral_code = uuidv4();

                                             if (requestName && requestGender && requestContact && requestDay) {

                                                QRCode.toFile(`./public/images/qrcode_personal_${chatId}.png`, personal_code, {}, async (err) => {
                                                   if (err) throw err;
                                                })

                                                QRCode.toFile(`./public/images/qrcode_referral_${chatId}.png`, referral_code, {}, async (err) => {
                                                   if (err) throw err;
                                                })


                                                const registerUser = await model.registerUser(
                                                   requestName,
                                                   requestGender,
                                                   requestDay,
                                                   requestAge,
                                                   `+${requestContact}`,
                                                   chatId,
                                                   personal_code,
                                                   referral_code,
                                                   `${process.env.BACKEND_URL}/qrcode_personal_${chatId}.png`,
                                                   `qrcode_personal_${chatId}.png`,
                                                   `${process.env.BACKEND_URL}/qrcode_referral_${chatId}.png`,
                                                   `qrcode_referral_${chatId}.png`,
                                                   lang
                                                )

                                                if (registerUser) {
                                                   bot.sendMessage(chatId, `${requestName}, вы успешно зарегистрировались.`, {
                                                      reply_markup: JSON.stringify({
                                                         keyboard: [
                                                            [
                                                               {
                                                                  text: "🛍 Buyurtma berish"
                                                               }
                                                            ],
                                                            [
                                                               {
                                                                  text: "✍️ Fikr bildirish"
                                                               },
                                                               {
                                                                  text: "💸 Jamg'arma"
                                                               }
                                                            ],
                                                            [
                                                               {
                                                                  text: "ℹ️ Maʼlumot"
                                                               },
                                                               {
                                                                  text: "⚙️ Sozlamalar"
                                                               }
                                                            ],
                                                            [
                                                               {
                                                                  text: "👥 Yaqinlarim"
                                                               }
                                                            ]
                                                         ],
                                                         resize_keyboard: true
                                                      })
                                                   })
                                                }
                                             }
                                          }
                                       })
                                    })
                                 }
                              })
                           })
                        }
                     })
                  })
               }
            })
         })
      }
   }
})

// CASHBEK
bot.on('message', async msg => {
   const chatId = msg.chat.id
   const text = msg.text
   const foundUserByChatId = await model.foundUserByChatId(chatId)

   if (text == "💸 Jamg'arma") {
      const total = formatNumber(foundUserByChatId?.user_cashbek)

      if (foundUserByChatId) {
         bot.sendMessage(chatId, `Hisobingiz: ${total} sum`, {
            reply_markup: JSON.stringify({
               keyboard: [
                  [
                     {
                        text: "🆔 QR-kod"
                     }
                  ],
                  [
                     {
                        text: "🧑‍🤝‍🧑 Do'stlarga yuborish"
                     }
                  ],
                  [
                     {
                        text: "⬅️ Ortga"
                     }
                  ],
               ],
               resize_keyboard: true
            })
         })
      }
   } else if (text == '🆔 QR-kod' || text == '🆔 Получить QR-код') {
      bot.sendPhoto(chatId, `./public/images/${foundUserByChatId?.user_personal_code_image_name}`)
   } else if (text == "🧑‍🤝‍🧑 Do'stlarga yuborish" || text == '🧑‍🤝‍🧑 Отправить друзьям') {
      bot.sendPhoto(chatId, `./public/images/${foundUserByChatId?.user_referral_bonus_image_name}`)
   } else if (text == '💸 Накопитель') {
      const total = formatNumber(foundUserByChatId?.user_cashbek)

      if (foundUserByChatId) {
         bot.sendMessage(chatId, `Баланс на счету: ${total} сум`, {
            reply_markup: JSON.stringify({
               keyboard: [
                  [
                     {
                        text: "🆔 Получить QR-код"
                     }
                  ],
                  [
                     {
                        text: "🧑‍🤝‍🧑 Отправить друзьям"
                     }
                  ],
                  [
                     {
                        text: "⬅️ Назад"
                     }
                  ],
               ],
               resize_keyboard: true
            })
         })
      }
   }

})

// SETTINGS
bot.on('message', async msg => {
   const chatId = msg.chat.id
   const text = msg.text
   const foundUserByChatId = await model.foundUserByChatId(chatId)

   if (text == '⚙️ Sozlamalar') {
      bot.sendMessage(chatId, '⚙️ Sozlamalar', {
         reply_markup: JSON.stringify({
            keyboard: [
               [
                  {
                     text: "Ismni o'zgartirish"
                  },
                  {
                     text: "Raqamni o'zgartirish"
                  },
               ],
               [
                  {
                     text: "Tilni tanlang"
                  }
               ],
               [
                  {
                     text: "⬅️ Ortga"
                  }
               ]
            ],
            resize_keyboard: true
         })
      })
   } else if (text == "Ismni o'zgartirish") {
      if (foundUserByChatId) {
         bot.sendMessage(chatId, 'Ismingizni yozing', {
            reply_markup: {
               force_reply: true
            }
         }).then(payload => {
            const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, async msg => {
               bot.removeListener(replyListenerId)
               if (msg.text) {
                  const editUserName = await model.editUserName(foundUserByChatId?.user_id, msg?.text)

                  if (editUserName) {
                     bot.sendMessage(chatId, '⚙️ Sozlamalar', {
                        reply_markup: JSON.stringify({
                           keyboard: [
                              [
                                 {
                                    text: "Ismni o'zgartirish"
                                 },
                                 {
                                    text: "Raqamni o'zgartirish"
                                 },
                              ],
                              [
                                 {
                                    text: "Tilni tanlang"
                                 }
                              ],
                              [
                                 {
                                    text: "⬅️ Ortga"
                                 }
                              ]
                           ],
                           resize_keyboard: true
                        })
                     })
                  }
               }
            })
         })
      }
   } else if (text == "Raqamni o'zgartirish") {
      bot.sendMessage(chatId, '📱 Raqamni +998********* shaklda yuboring.', {
         reply_markup: {
            force_reply: true
         }
      }).then(payload => {
         const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, async msg => {
            bot.removeListener(replyListenerId)
            if (msg.text) {
               const editUserContact = await model.editUserContact(foundUserByChatId?.user_id, msg?.text)

               if (editUserContact) {
                  bot.sendMessage(chatId, '⚙️ Sozlamalar', {
                     reply_markup: JSON.stringify({
                        keyboard: [
                           [
                              {
                                 text: "Ismni o'zgartirish"
                              },
                              {
                                 text: "Raqamni o'zgartirish"
                              },
                           ],
                           [
                              {
                                 text: "Tilni tanlang"
                              }
                           ],
                           [
                              {
                                 text: "⬅️ Ortga"
                              }
                           ]
                        ],
                        resize_keyboard: true
                     })
                  })
               }
            }
         })
      })
   } else if (text == "Tilni tanlang") {
      bot.sendMessage(chatId, 'Tilni tanlang', {
         reply_markup: {
            inline_keyboard: [
               [
                  {
                     text: "Uzbek 🇺🇿",
                     callback_data: "uz",
                  },
                  {
                     text: "Русский 🇷🇺",
                     callback_data: "ru",
                  },
               ]
            ]
         }
      })
   } else if (text == '⚙️ Настройки') {
      bot.sendMessage(chatId, '⚙️ Настройки', {
         reply_markup: JSON.stringify({
            keyboard: [
               [
                  {
                     text: "Изменить ФИО"
                  },
                  {
                     text: "Изменить номер"
                  },
               ],
               [
                  {
                     text: "Выберите язык"
                  }
               ],
               [
                  {
                     text: "⬅️ Назад"
                  }
               ]
            ],
            resize_keyboard: true
         })
      })
   } else if (text == 'Изменить ФИО') {
      if (foundUserByChatId) {
         bot.sendMessage(chatId, 'Введите имя', {
            reply_markup: {
               force_reply: true
            }
         }).then(payload => {
            const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, async msg => {
               bot.removeListener(replyListenerId)
               if (msg.text) {
                  const editUserName = await model.editUserName(foundUserByChatId?.user_id, msg?.text)

                  if (editUserName) {
                     bot.sendMessage(chatId, '⚙️ Настройки', {
                        reply_markup: JSON.stringify({
                           keyboard: [
                              [
                                 {
                                    text: "Изменить ФИО"
                                 },
                                 {
                                    text: "Изменить номер"
                                 },
                              ],
                              [
                                 {
                                    text: "Выберите язык"
                                 }
                              ],
                              [
                                 {
                                    text: "⬅️ Назад"
                                 }
                              ]
                           ],
                           resize_keyboard: true
                        })
                     })
                  }
               }
            })
         })
      }
   } else if (text == "Изменить номер") {
      bot.sendMessage(chatId, '📱 Отправьте номер телефона для звонков в формате: +998*********', {
         reply_markup: {
            force_reply: true
         }
      }).then(payload => {
         const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, async msg => {
            bot.removeListener(replyListenerId)
            if (msg.text) {
               const editUserContact = await model.editUserContact(foundUserByChatId?.user_id, msg?.text)

               if (editUserContact) {
                  bot.sendMessage(chatId, '⚙️ Настройки', {
                     reply_markup: JSON.stringify({
                        keyboard: [
                           [
                              {
                                 text: "Изменить ФИО"
                              },
                              {
                                 text: "Изменить номер"
                              },
                           ],
                           [
                              {
                                 text: "Выберите язык"
                              }
                           ],
                           [
                              {
                                 text: "⬅️ Назад"
                              }
                           ]
                        ],
                        resize_keyboard: true
                     })
                  })
               }
            }
         })
      })
   } else if (text == 'Выберите язык') {
      bot.sendMessage(chatId, 'Выберите язык', {
         reply_markup: {
            inline_keyboard: [
               [
                  {
                     text: "Uzbek 🇺🇿",
                     callback_data: "uz",
                  },
                  {
                     text: "Русский 🇷🇺",
                     callback_data: "ru",
                  },
               ]
            ]
         }
      })
   }
})

// BACK
bot.on('message', async msg => {
   const chatId = msg.chat.id
   const text = msg.text

   if (text == "⬅️ Ortga") {
      const foundUserByChatId = await model.foundUserByChatId(chatId)

      bot.sendMessage(chatId, `${foundUserByChatId?.user_name}! Birgalikda buyurtma beramizmi? 😃`, {
         reply_markup: JSON.stringify({
            keyboard: [
               [
                  {
                     text: "🛍 Buyurtma berish"
                  }
               ],
               [
                  {
                     text: "✍️ Fikr bildirish"
                  },
                  {
                     text: "💸 Jamg'arma"
                  }
               ],
               [
                  {
                     text: "ℹ️ Maʼlumot"
                  },
                  {
                     text: "⚙️ Sozlamalar"
                  }
               ],
               [
                  {
                     text: "👥 Yaqinlarim"
                  }
               ]
            ],
            resize_keyboard: true
         })
      })
   } else if (text == "⬅️ Назад") {
      const foundUserByChatId = await model.foundUserByChatId(chatId)

      bot.sendMessage(chatId, `${foundUserByChatId?.user_name}! Оформим заказ вместе? 😃`, {
         reply_markup: JSON.stringify({
            keyboard: [
               [
                  {
                     text: "🛍 Заказать"
                  }
               ],
               [
                  {
                     text: "✍️ Оставить отзыв"
                  },
                  {
                     text: "💸 Накопитель"
                  }
               ],
               [
                  {
                     text: "ℹ️ Информация"
                  },
                  {
                     text: "⚙️ Настройки"
                  }
               ],
               [
                  {
                     text: "👥 Мои близкие"
                  }
               ]
            ],
            resize_keyboard: true
         })
      })
   }
})

// Information
bot.on('message', async msg => {
   const chatId = msg.chat.id
   const text = msg.text

   if (text == "ℹ️ Maʼlumot") {
      bot.sendMessage(chatId, `ℹ️ Maʼlumot`, {
         reply_markup: JSON.stringify({
            keyboard: [
               [
                  {
                     text: "Bizning manzil 📍"
                  },
                  {
                     text: "☎️ Biz bilan aloqa"
                  }
               ],
               [
                  {
                     text: "Ijtimoiy tarmoqlar"
                  }
               ],
               [
                  {
                     text: "⬅️ Ortga"
                  }
               ]
            ],
            resize_keyboard: true
         })
      })
   } else if (text == "Bizning manzil 📍") {
      const latitude = 41.330722;
      const longitude = 69.304972;

      bot.sendLocation(chatId, latitude, longitude)
   } else if (text == "☎️ Biz bilan aloqa") {
      bot.sendMessage(chatId, `+998 97 574 33 33`)
   } else if (text == 'Ijtimoiy tarmoqlar') {
      bot.sendMessage(chatId, 'Ijtimoiy tarmoqlar', {
         reply_markup: {
            inline_keyboard: [
               [
                  {
                     text: "Instagram",
                     callback_data: "instagram",
                     url: "https://www.instagram.com/dery_confectionery/"
                  },
               ],
               [
                  {
                     text: "Telegram",
                     callback_data: "telegram",
                     url: "https://t.me/deryhouse"
                  },
               ],
               [
                  {
                     text: "Facebook",
                     callback_data: "facebook",
                     url: "https://www.facebook.com/people/Dery-Confectionery/pfbid0GCoXoNojMRo7HiZvcMSaLsRfukfD6r2fD3og56yfHXGknCeBVgbcFqMzucti1dcrl/"
                  },
               ]
            ]
         }
      })
   } else if (text == "ℹ️ Информация") {
      bot.sendMessage(chatId, `ℹ️ Maʼlumot`, {
         reply_markup: JSON.stringify({
            keyboard: [
               [
                  {
                     text: "Наш адрес 📍"
                  },
                  {
                     text: "☎️ Связаться с нами"
                  }
               ],
               [
                  {
                     text: "Социальные медиа"
                  }
               ],
               [
                  {
                     text: "⬅️ Назад"
                  }
               ]
            ],
            resize_keyboard: true
         })
      })
   } else if (text == "Наш адрес 📍") {
      const latitude = 41.330722;
      const longitude = 69.304972;

      bot.sendLocation(chatId, latitude, longitude)
   } else if (text == "☎️ Связаться с нами") {
      bot.sendMessage(chatId, `+998 97 574 33 33`)
   } else if (text == "Социальные медиа") {
      bot.sendMessage(chatId, 'Социальные медиа', {
         reply_markup: {
            inline_keyboard: [
               [
                  {
                     text: "Инстаграм",
                     callback_data: "instagram",
                     url: "https://www.instagram.com/dery_confectionery/"
                  },
               ],
               [
                  {
                     text: "Телеграмма",
                     callback_data: "telegram",
                     url: "https://t.me/deryhouse"
                  },
               ],
               [
                  {
                     text: "Фейсбук",
                     callback_data: "facebook",
                     url: "https://www.facebook.com/people/Dery-Confectionery/pfbid0GCoXoNojMRo7HiZvcMSaLsRfukfD6r2fD3og56yfHXGknCeBVgbcFqMzucti1dcrl/"
                  },
               ]
            ]
         }
      })
   }
})

// REVIEW
bot.on("message", async msg => {
   const chatId = msg.chat.id
   const text = msg.text
   const foundUserByChatId = await model.foundUserByChatId(chatId)

   if (text == '✍️ Fikr bildirish') {
      if (foundUserByChatId) {
         bot.sendMessage(chatId, 'Sizning fikringiz biz uchun muhim. Iltimos, fikr-mulohazalaringizni qoldiring.', {
            reply_markup: {
               force_reply: true
            }
         }).then(payload => {
            const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, async msg => {
               bot.removeListener(replyListenerId)

               if (msg.text) {
                  const addReview = await model.addReview(foundUserByChatId?.user_id, msg.text)

                  if (addReview) {
                     bot.sendMessage(chatId, `${foundUserByChatId?.user_name}, fikringiz uchun rahmat😊`, {
                        reply_markup: JSON.stringify({
                           keyboard: [
                              [
                                 {
                                    text: "🛍 Buyurtma berish"
                                 }
                              ],
                              [
                                 {
                                    text: "✍️ Fikr bildirish"
                                 },
                                 {
                                    text: "💸 Jamg'arma"
                                 }
                              ],
                              [
                                 {
                                    text: "ℹ️ Maʼlumot"
                                 },
                                 {
                                    text: "⚙️ Sozlamalar"
                                 }
                              ],
                              [
                                 {
                                    text: "👥 Yaqinlarim"
                                 }
                              ]
                           ],
                           resize_keyboard: true
                        })
                     })
                  }
               }
            })
         })
      }
   } else if (text == "✍️ Оставить отзыв") {
      if (foundUserByChatId) {
         bot.sendMessage(chatId, 'Нам важно ваше мнение. Пожалуйста оставьте свой отзыв.', {
            reply_markup: {
               force_reply: true
            }
         }).then(payload => {
            const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, async msg => {
               bot.removeListener(replyListenerId)

               if (msg.text) {
                  const addReview = await model.addReview(foundUserByChatId?.user_id, msg.text)

                  if (addReview) {
                     bot.sendMessage(chatId, `${foundUserByChatId?.user_name}, Спасибо за ваше мнение`, {
                        reply_markup: JSON.stringify({
                           keyboard: [
                              [
                                 {
                                    text: "🛍 Заказать"
                                 }
                              ],
                              [
                                 {
                                    text: "✍️ Оставить отзыв"
                                 },
                                 {
                                    text: "💸 Накопитель"
                                 }
                              ],
                              [
                                 {
                                    text: "ℹ️ Информация"
                                 },
                                 {
                                    text: "⚙️ Настройки"
                                 }
                              ],
                              [
                                 {
                                    text: "👥 Мои близкие"
                                 }
                              ]
                           ],
                           resize_keyboard: true
                        })
                     })
                  }
               }
            })
         })
      }
   }
})

// USER RELATIONSHIP
bot.on("message", async msg => {
   const chatId = msg.chat.id
   const text = msg.text

   if (text == "👥 Yaqinlarim") {
      bot.sendMessage(chatId, '👥 Yaqinlarim', {
         reply_markup: JSON.stringify({
            keyboard: [
               [
                  {
                     text: "👥 Ro'yxat"
                  }
               ],
               [
                  {
                     text: "➕ Qo'shish"
                  }
               ],
               [
                  {
                     text: "⬅️ Ortga"
                  }
               ]
            ],
            resize_keyboard: true
         })
      })
   } else if (text == "👥 Ro'yxat") {
      const foundUserByChatId = await model.foundUserByChatId(chatId)
      const foundUserRelationship = await model.foundUserRelationship(foundUserByChatId?.user_id)

      if (foundUserRelationship?.length > 0) {
         const relationshipList = foundUserRelationship.map((person, index) => `${index + 1}. ${person.relationship_name} - ${person.relationship_birthday} tu'gilgan kuni.`).join("\n");

         bot.sendMessage(chatId, relationshipList, {
            reply_markup: JSON.stringify({
               keyboard: [
                  [
                     {
                        text: "⬅️ Ortga"
                     }
                  ]
               ],
               resize_keyboard: true
            })
         })
      } else {
         bot.sendMessage(chatId, "Topilmadi😕", {
            reply_markup: JSON.stringify({
               keyboard: [
                  [
                     {
                        text: "⬅️ Ortga"
                     }
                  ]
               ],
               resize_keyboard: true
            })
         })
      }
   } else if (text == "➕ Qo'shish") {
      let requestName
      let requestBirthday
      let requestGender
      let requestAge

      bot.sendMessage(chatId, "Ismini yozing", {
         reply_markup: {
            force_reply: true
         }
      }).then(payload => {
         const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, msg => {
            bot.removeListener(replyListenerId)

            if (msg.text) {
               requestName = msg.text

               bot.sendMessage(msg.chat.id, "Tug'ilgan kunini yozing, ss.oo.yyyy", {
                  reply_markup: {
                     force_reply: true
                  }
               }).then(payload => {
                  const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, async (msg) => {
                     bot.removeListener(replyListenerId)


                     if (msg.text) {
                        requestBirthday = msg.text
                        requestAge = calculateAge(msg.text)

                        bot.sendMessage(msg.chat.id, `Jinsini tanlang`, {
                           reply_markup: JSON.stringify({
                              keyboard:
                                 [
                                    [
                                       {
                                          text: 'Erkak',
                                          force_reply: true
                                       },
                                       {
                                          text: 'Ayol',
                                          force_reply: true
                                       }
                                    ]
                                 ],
                              resize_keyboard: true
                           })
                        }).then(payload => {
                           const replyListenerId = bot.on('message', async msg => {
                              bot.removeListener(replyListenerId)

                              if (msg.text) {
                                 requestGender = msg.text

                                 if (requestName && requestBirthday && requestAge && requestGender) {

                                    const foundUserByChatId = await model.foundUserByChatId(chatId)
                                    const addUserRelationship = await model.addUserRelationship(
                                       requestName,
                                       requestBirthday,
                                       requestAge,
                                       requestGender,
                                       foundUserByChatId?.user_id
                                    )

                                    if (addUserRelationship) {
                                       bot.sendMessage(chatId, "Muvaffaqiyatli qo'shildi", {
                                          reply_markup: JSON.stringify({
                                             keyboard: [
                                                [
                                                   {
                                                      text: "👥 Ro'yxat"
                                                   }
                                                ],
                                                [
                                                   {
                                                      text: "➕ Qo'shish"
                                                   }
                                                ],
                                                [
                                                   {
                                                      text: "⬅️ Ortga"
                                                   }
                                                ]
                                             ],
                                             resize_keyboard: true
                                          })
                                       })
                                    }
                                 }
                              }
                           })
                        })
                     }
                  })
               })
            }

         })
      })
   } else if (text == "👥 Мои близкие") {

      bot.sendMessage(chatId, '👥 Мои близкие', {
         reply_markup: JSON.stringify({
            keyboard: [
               [
                  {
                     text: "👥 Список"
                  }
               ],
               [
                  {
                     text: "➕ Добавить"
                  }
               ],
               [
                  {
                     text: "⬅️ Назад"
                  }
               ]
            ],
            resize_keyboard: true
         })
      })
   } else if (text == "👥 Список") {
      const foundUserByChatId = await model.foundUserByChatId(chatId)
      const foundUserRelationship = await model.foundUserRelationship(foundUserByChatId?.user_id)

      if (foundUserRelationship?.length > 0) {
         const relationshipList = foundUserRelationship.map((person, index) => `${index + 1}. ${person.relationship_name} - ${person.relationship_birthday} Дата рождения.`).join("\n");

         bot.sendMessage(chatId, relationshipList, {
            reply_markup: JSON.stringify({
               keyboard: [
                  [
                     {
                        text: "⬅️ Назад"
                     }
                  ]
               ],
               resize_keyboard: true
            })
         })
      } else {
         bot.sendMessage(chatId, "Не найдено😕", {
            reply_markup: JSON.stringify({
               keyboard: [
                  [
                     {
                        text: "⬅️ Назад"
                     }
                  ]
               ],
               resize_keyboard: true
            })
         })
      }
   } else if (text == "➕ Добавить") {
      let requestName
      let requestBirthday
      let requestGender
      let requestAge

      bot.sendMessage(chatId, "Напишите имя", {
         reply_markup: {
            force_reply: true
         }
      }).then(payload => {
         const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, msg => {
            bot.removeListener(replyListenerId)

            if (msg.text) {
               requestName = msg.text

               bot.sendMessage(msg.chat.id, "Напишите дату рождения дд.мм.гггг", {
                  reply_markup: {
                     force_reply: true
                  }
               }).then(payload => {
                  const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, async (msg) => {
                     bot.removeListener(replyListenerId)


                     if (msg.text) {
                        requestBirthday = msg.text
                        requestAge = calculateAge(msg.text)

                        bot.sendMessage(msg.chat.id, `Выберите пол`, {
                           reply_markup: JSON.stringify({
                              keyboard:
                                 [
                                    [
                                       {
                                          text: 'Мужской',
                                          force_reply: true
                                       },
                                       {
                                          text: 'Женщина',
                                          force_reply: true
                                       }
                                    ]
                                 ],
                              resize_keyboard: true
                           })
                        }).then(payload => {
                           const replyListenerId = bot.on('message', async msg => {
                              bot.removeListener(replyListenerId)

                              if (msg.text) {
                                 requestGender = msg.text

                                 if (requestName && requestBirthday && requestAge && requestGender) {

                                    const foundUserByChatId = await model.foundUserByChatId(chatId)
                                    const addUserRelationship = await model.addUserRelationship(
                                       requestName,
                                       requestBirthday,
                                       requestAge,
                                       requestGender,
                                       foundUserByChatId?.user_id
                                    )

                                    if (addUserRelationship) {
                                       bot.sendMessage(chatId, "Добавлено успешно", {
                                          reply_markup: JSON.stringify({
                                             keyboard: [
                                                [
                                                   {
                                                      text: "👥 Список"
                                                   }
                                                ],
                                                [
                                                   {
                                                      text: "➕ Добавить"
                                                   }
                                                ],
                                                [
                                                   {
                                                      text: "⬅️ Назад"
                                                   }
                                                ]
                                             ],
                                             resize_keyboard: true
                                          })
                                       })
                                    }
                                 }
                              }
                           })
                        })
                     }
                  })
               })
            }

         })
      })
   }
})

//  ORDER
let deleviry = false;

bot.on("message", async msg => {
   const chatId = msg.chat.id
   const text = msg.text

   if (text == "🛍 Buyurtma berish") {
      bot.sendMessage(chatId, "Buyurtmani o'zingiz olib keting yoki Yetkazib berishni tanlang", {
         reply_markup: JSON.stringify({
            keyboard: [
               [
                  {
                     text: "🚖 Yetkazib berish"
                  },
                  {
                     text: "🏃 Olib ketish"
                  },
               ],
               [
                  {
                     text: "⬅️ Ortga"
                  }
               ]
            ],
            resize_keyboard: true
         })
      })
   } else if (text == "🚖 Yetkazib berish") {
      deleviry = true
      bot.sendMessage(chatId, "Buyurtmangizni qayerga yetkazib berish kerak 🚙?", {
         reply_markup: JSON.stringify({
            keyboard: [
               [
                  {
                     text: "📍 Manzilni yuborish",
                     request_location: true
                  }
               ],
               [
                  {
                     text: "⬅️ Ortga"
                  }
               ]
            ],
            resize_keyboard: true
         })
      })
   } else if (text == "🏃 Olib ketish") {
      const categories = await model.categories()
      const latitude = 41.330722;
      const longitude = 69.304972;
      const categoriesKeyboard = categories.map(category => {
         return [{ text: category.category_name_uz }];
      });
      categoriesKeyboard.push([{ text: "Savat" }])
      categoriesKeyboard.push([{ text: "⬅️ Ortga" }])

      bot.sendLocation(chatId, latitude, longitude)
      bot.sendMessage(chatId, "Kategoriyani tanlang?", {
         reply_markup: JSON.stringify({
            keyboard: categoriesKeyboard,
            resize_keyboard: true
         })
      })
   } else if (text == "🛍 Заказать") {
      bot.sendMessage(chatId, "Заберите заказ самостоятельно или выберите «Доставка»", {
         reply_markup: JSON.stringify({
            keyboard: [
               [
                  {
                     text: "🚖 Доставка"
                  },
                  {
                     text: "🏃 Забрать"
                  },
               ],
               [
                  {
                     text: "⬅️ Назад"
                  }
               ]
            ],
            resize_keyboard: true
         })
      })
   } else if (text == "🚖 Доставка") {
      deleviry = true
      bot.sendMessage(chatId, "Куда доставить ваш заказ 🚙?", {
         reply_markup: JSON.stringify({
            keyboard: [
               [
                  {
                     text: "📍 Отправить адрес",
                     request_location: true
                  }
               ],
               [
                  {
                     text: "⬅️ Назад"
                  }
               ]
            ],
            resize_keyboard: true
         })
      })
   } else if (text == "🏃 Забрать") {
      const categories = await model.categories()
      const latitude = 41.330722;
      const longitude = 69.304972;
      const categoriesKeyboard = categories.map(category => {
         return [{ text: category.category_name_uz }];
      });
      categoriesKeyboard.push([{ text: "Корзина" }])
      categoriesKeyboard.push([{ text: "⬅️ Назад" }])

      bot.sendLocation(chatId, latitude, longitude)
      bot.sendMessage(chatId, "Выберите категорию", {
         reply_markup: JSON.stringify({
            keyboard: categoriesKeyboard,
            resize_keyboard: true
         })
      })
   }
})

// let products_id = []
let clientLatitude;
let clientLongitude;
let product = {};
const userStates = {}; // This will hold the state of each user
const products_id = [];


bot.on("location", async msg => {
   const chatId = msg.chat.id;
   const location = msg.location;
   clientLatitude = location.latitude
   clientLongitude = location.longitude

   const categories = await model.categories()
   const foundUserByChatId = await model.foundUserByChatId(chatId);

   if (foundUserByChatId?.user_lang == 'uz') {
      const categoriesKeyboard = categories.map(category => {
         return [{ text: category.category_name_uz }];
      });
      categoriesKeyboard.push([{ text: "Savat" }])
      categoriesKeyboard.push([{ text: "⬅️ Ortga" }])

      bot.sendMessage(chatId, "Kategoriyani tanlang", {
         reply_markup: JSON.stringify({
            keyboard: categoriesKeyboard,
            resize_keyboard: true
         })
      })
   } else if (foundUserByChatId?.user_lang == 'ru') {
      const categoriesKeyboard = categories.map(category => {
         return [{ text: category.category_name_uz }];
      });
      categoriesKeyboard.push([{ text: "Корзина" }])
      categoriesKeyboard.push([{ text: "⬅️ Назад" }])

      bot.sendMessage(chatId, "Выберите категорию", {
         reply_markup: JSON.stringify({
            keyboard: categoriesKeyboard,
            resize_keyboard: true
         })
      })
   }
})

bot.on("message", async msg => {
   const chatId = msg.chat.id;
   const text = msg.text;

   // Initialize user state if not present
   if (!userStates[chatId]) {
      userStates[chatId] = {
         lang: null,
         currentCategory: null,
         currentProduct: null
      };
   }

   const foundUserByChatId = await model.foundUserByChatId(chatId);
   if (foundUserByChatId) {
      userStates[chatId].lang = foundUserByChatId.user_lang;
   }

   const foundCategory = await model.foundCategory(text);
   if (foundCategory && userStates[chatId].lang == "uz") {
      userStates[chatId].currentCategory = foundCategory;

      const productsListByCategoryId = await model.productsListByCategoryId(foundCategory.category_id);
      const inlineKeyboard = productsListByCategoryId.map(e => {
         return [{ text: e.product_name_uz, callback_data: e.product_id }];
      });

      bot.sendMessage(chatId, "Taomni tanlang", {
         reply_markup: {
            inline_keyboard: inlineKeyboard,
         }
      });

   } else if (foundCategory && userStates[chatId].lang == "ru") {
      userStates[chatId].currentCategory = foundCategory;

      const productsListByCategoryId = await model.productsListByCategoryId(foundCategory.category_id);
      const inlineKeyboard = productsListByCategoryId.map(e => {
         return [{ text: e.product_name_ru, callback_data: e.product_id }];
      });

      bot.sendMessage(chatId, "Выберите блюдо", {
         reply_markup: {
            inline_keyboard: inlineKeyboard,
         }
      });

   } else if (userStates[chatId].currentCategory && !isNaN(Number(text))) {
      const count = Number(text);

      if (!isNaN(count) && count > 0) {
         userStates[chatId].currentProduct['count'] = count;
         userStates[chatId].currentProduct['total'] = Number(count * userStates[chatId].currentProduct['product_price']);
         products_id.push(userStates[chatId].currentProduct);
         userStates[chatId].currentProduct = null;

         const categories = await model.categories();
         const categoriesKeyboard = categories.map(category => {
            if (foundUserByChatId.user_lang == 'uz') {
               return [{ text: category.category_name_uz }];
            } else if (foundUserByChatId.user_lang == 'ru') {
               return [{ text: category.category_name_ru }];
            }
         });

         if (foundUserByChatId.user_lang == 'uz') {
            categoriesKeyboard.push([{ text: "Savat" }])
            categoriesKeyboard.push([{ text: "⬅️ Ortga" }])

            bot.sendMessage(chatId, "Savatga qo'shildi", {
               reply_markup: {
                  keyboard: categoriesKeyboard,
                  resize_keyboard: true
               }
            });
         } else if (foundUserByChatId.user_lang == 'ru') {
            categoriesKeyboard.push([{ text: "Корзина" }])
            categoriesKeyboard.push([{ text: "⬅️ Назад" }])

            bot.sendMessage(chatId, "Добавлено в корзину", {
               reply_markup: {
                  keyboard: categoriesKeyboard,
                  resize_keyboard: true
               }
            });
         }
      }
   }
});

bot.on("callback_query", async callbackQuery => {
   const chatId = callbackQuery.message.chat.id;
   const productId = callbackQuery.data;

   if (!isNaN(Number(productId))) {
      const foundProduct = await model.foundProduct(productId);
      if (foundProduct) {
         const product = foundProduct;
         userStates[chatId].currentProduct = product;

         if (userStates[chatId].lang == "uz") {
            const content = `<strong>${foundProduct.product_name_uz}</strong>\n\n${foundProduct.product_description_uz}\n${formatNumber(foundProduct.product_price)} sum`;
            bot.sendMessage(chatId, content, {
               parse_mode: "HTML",
               reply_markup: {
                  keyboard: [
                     [{ text: '1' }, { text: '2' }, { text: '3' }, { text: '4' }]
                  ],
                  resize_keyboard: true
               }
            });
         } else if (userStates[chatId].lang == "ru") {
            const content = `<strong>${foundProduct.product_name_ru}</strong>\n\n${foundProduct.product_description_ru}\n${formatNumber(foundProduct.product_price)} сум`;
            bot.sendMessage(chatId, content, {
               parse_mode: "HTML",
               reply_markup: {
                  keyboard: [
                     [{ text: '1' }, { text: '2' }, { text: '3' }, { text: '4' }]
                  ],
                  resize_keyboard: true
               }
            });
         }

      }
   }
});

bot.on("message", async msg => {
   const chatId = msg.chat.id;
   const text = msg.text;

   if (text == "Savat") {
      if (products_id?.length > 0) {
         const products = products_id.map((e, index) => `${index + 1}. ${e.product_name_uz} - ${formatNumber(Number(e.total))} sum`).join("\n");
         const totalAmount = products_id
            .reduce((acc, e) => acc + Number(e.total), 0);

         if (deleviry) {
            bot.sendMessage(chatId, `${products}\nYetkazib berish - 20 000 sum\nJami: ${formatNumber(totalAmount + 20000)} sum`, {
               reply_markup: JSON.stringify({
                  keyboard: [
                     [
                        { text: "Tasdiqlash" }
                     ],
                     [
                        { text: "Bekor qilish" }
                     ],
                  ],
                  resize_keyboard: true
               })
            })
         } else {
            bot.sendMessage(chatId, `${products}\nJami: ${formatNumber(totalAmount)} sum`, {
               reply_markup: JSON.stringify({
                  keyboard: [
                     [
                        { text: "Tasdiqlash" }
                     ],
                     [
                        { text: "Bekor qilish" }
                     ],
                  ],
                  resize_keyboard: true
               })
            })
         }

      } else {
         bot.sendMessage(chatId, "Savat bo'sh", {
            reply_markup: JSON.stringify({
               keyboard: [
                  [
                     {
                        text: "⬅️ Ortga"
                     }
                  ]
               ],
               resize_keyboard: true
            })
         })
      }
   } else if (text == "Корзина") {
      if (products_id?.length > 0) {
         const products = products_id.map((e, index) => `${index + 1}. ${e.product_name_ru} - ${formatNumber(Number(e.total))} сум`).join("\n");
         const totalAmount = products_id
            .reduce((acc, e) => acc + Number(e.total), 0);

         if (deleviry) {
            bot.sendMessage(chatId, `${products}\nДоставка - 20 000 сум\Общий: ${formatNumber(totalAmount + 20000)} сум`, {
               reply_markup: JSON.stringify({
                  keyboard: [
                     [
                        { text: "Подтвердить" }
                     ],
                     [
                        { text: "Отмена" }
                     ],
                  ],
                  resize_keyboard: true
               })
            })
         } else {
            bot.sendMessage(chatId, `${products}\nОбщий: ${formatNumber(totalAmount)} сум`, {
               reply_markup: JSON.stringify({
                  keyboard: [
                     [
                        { text: "Подтвердить" }
                     ],
                     [
                        { text: "Отмена" }
                     ],
                  ],
                  resize_keyboard: true
               })
            })
         }

      } else {
         bot.sendMessage(chatId, "Корзина пуста", {
            reply_markup: JSON.stringify({
               keyboard: [
                  [
                     {
                        text: "⬅️ Назад"
                     }
                  ]
               ],
               resize_keyboard: true
            })
         })
      }
   }
})

bot.on("message", async msg => {
   const chatId = msg.chat.id;
   const text = msg.text;

   if (text == "Tasdiqlash") {
      const totalAmount = products_id
         .reduce((acc, e) => acc + Number(e.total), 0);
      const foundUserByChatId = await model.foundUserByChatId(chatId)
      const addOrder = await model.addOrder(
         foundUserByChatId?.user_id,
         products_id,
         totalAmount
      )

      if (addOrder) {
         bot.sendMessage(chatId, "Buyurtmangiz qabul qilindi", {
            reply_markup: JSON.stringify({
               keyboard: [
                  [
                     {
                        text: "🛍 Buyurtma berish"
                     }
                  ],
                  [
                     {
                        text: "✍️ Fikr bildirish"
                     },
                     {
                        text: "💸 Jamg'arma"
                     }
                  ],
                  [
                     {
                        text: "ℹ️ Maʼlumot"
                     },
                     {
                        text: "⚙️ Sozlamalar"
                     }
                  ],
                  [
                     {
                        text: "👥 Yaqinlarim"
                     }
                  ]
               ],
               resize_keyboard: true
            })
         })
      }

   } else if (text == "Bekor qilish") {
      products_id.length = 0;
      bot.sendMessage(chatId, "Buyurtmangiz bekor qilindi", {
         reply_markup: JSON.stringify({
            keyboard: [
               [
                  {
                     text: "🛍 Buyurtma berish"
                  }
               ],
               [
                  {
                     text: "✍️ Fikr bildirish"
                  },
                  {
                     text: "💸 Jamg'arma"
                  }
               ],
               [
                  {
                     text: "ℹ️ Maʼlumot"
                  },
                  {
                     text: "⚙️ Sozlamalar"
                  }
               ],
               [
                  {
                     text: "👥 Yaqinlarim"
                  }
               ]
            ],
            resize_keyboard: true
         })
      })
   } else if (text == "Подтвердить") {
      const totalAmount = products_id
         .reduce((acc, e) => acc + Number(e.total), 0);
      const foundUserByChatId = await model.foundUserByChatId(chatId)
      const addOrder = await model.addOrder(
         foundUserByChatId?.user_id,
         products_id,
         totalAmount
      )

      if (addOrder) {
         bot.sendMessage(chatId, "Ваш заказ принят", {
            reply_markup: JSON.stringify({
               keyboard: [
                  [
                     {
                        text: "🛍 Заказать"
                     }
                  ],
                  [
                     {
                        text: "✍️ Оставить отзыв"
                     },
                     {
                        text: "💸 Накопитель"
                     }
                  ],
                  [
                     {
                        text: "ℹ️ Информация"
                     },
                     {
                        text: "⚙️ Настройки"
                     }
                  ],
                  [
                     {
                        text: "👥 Мои близкие"
                     }
                  ]
               ],
               resize_keyboard: true
            })
         })
      }
   } else if (text == "Отмена") {
      products_id.length = 0;
      bot.sendMessage(chatId, "Ваш заказ был отменен", {
         reply_markup: JSON.stringify({
            keyboard: [
               [
                  {
                     text: "🛍 Заказать"
                  }
               ],
               [
                  {
                     text: "✍️ Оставить отзыв"
                  },
                  {
                     text: "💸 Накопитель"
                  }
               ],
               [
                  {
                     text: "ℹ️ Информация"
                  },
                  {
                     text: "⚙️ Настройки"
                  }
               ],
               [
                  {
                     text: "👥 Мои близкие"
                  }
               ]
            ],
            resize_keyboard: true
         })
      })
   }
})

app.use(cors({ origin: "*" }))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.resolve(__dirname, 'public')))
app.use("/api/v1", router);

app.listen(PORT, console.log(PORT));