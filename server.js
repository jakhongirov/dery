require('dotenv').config()
const express = require("express");
const cors = require("cors");
const app = express();
const { PORT } = require("./src/config");
const router = require("./src/modules");
const fs = require('fs');
const path = require('path')
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { bot } = require('./src/lib/bot')
const model = require('./model')
const { formatNumber } = require('./src/lib/functions')

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
                     const replyListenerId = bot.on("message", msg => {
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

                                    if (requestName && requestGender && requestContact) {

                                       QRCode.toFile(`./public/images/qrcode_personal_${chatId}.png`, personal_code, {}, async (err) => {
                                          if (err) throw err;
                                       })

                                       QRCode.toFile(`./public/images/qrcode_referral_${chatId}.png`, referral_code, {}, async (err) => {
                                          if (err) throw err;
                                       })


                                       const registerUser = await model.registerUser(
                                          requestName,
                                          requestGender,
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
                                    text: 'Девушка',
                                    force_reply: true
                                 }
                              ]
                           ],
                        resize_keyboard: true
                     })
                  }).then(payload => {
                     const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, msg => {
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

                                    if (requestName && requestGender && requestContact) {

                                       QRCode.toFile(`./public/images/qrcode_personal_${chatId}.png`, personal_code, {}, async (err) => {
                                          if (err) throw err;
                                       })

                                       QRCode.toFile(`./public/images/qrcode_referral_${chatId}.png`, referral_code, {}, async (err) => {
                                          if (err) throw err;
                                       })


                                       const registerUser = await model.registerUser(
                                          requestName,
                                          requestGender,
                                          `+${requestContact}`,
                                          chatId,
                                          personal_code,
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

      bot.sendMessage(chatId, "Ismini yozing", {
         reply_markup: {
            force_reply: true
         }
      }).then(payload => {
         const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, msg => {
            bot.removeListener(replyListenerId)

            if (msg.text) {
               requestName = msg.text

               bot.sendMessage(msg.chat.id, "Tug'ilgan kunini yozing, ss.oo", {
                  reply_markup: {
                     force_reply: true
                  }
               }).then(payload => {
                  const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, async (msg) => {
                     bot.removeListener(replyListenerId)


                     if (msg.text) {
                        requestBirthday = msg.text

                        if (requestName && requestBirthday) {
                           const foundUserByChatId = await model.foundUserByChatId(chatId)
                           const addUserRelationship = await model.addUserRelationship(
                              requestName,
                              requestBirthday,
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

      bot.sendMessage(chatId, "Напишите имя", {
         reply_markup: {
            force_reply: true
         }
      }).then(payload => {
         const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, msg => {
            bot.removeListener(replyListenerId)

            if (msg.text) {
               requestName = msg.text

               bot.sendMessage(msg.chat.id, "Напишите дату рождения, дд.мм", {
                  reply_markup: {
                     force_reply: true
                  }
               }).then(payload => {
                  const replyListenerId = bot.onReplyToMessage(payload.chat.id, payload.message_id, async (msg) => {
                     bot.removeListener(replyListenerId)

                     if (msg.text) {
                        requestBirthday = msg.text

                        if (requestName && requestBirthday) {
                           const foundUserByChatId = await model.foundUserByChatId(chatId)
                           const addUserRelationship = await model.addUserRelationship(
                              requestName,
                              requestBirthday,
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

app.use(cors({ origin: "*" }))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.resolve(__dirname, 'public')))
app.use("/api/v1", router);

app.listen(PORT, console.log(PORT));