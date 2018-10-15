# Релиз

1) Сначала надо остановить сервис крона. (Ничего страшного не произойдет если задачи 1-2 минуты не будут запускаться)
2) Останавливаем сервис Api (Он дождется как довыполнится пачка задач)
3) Останавливаем consumer'ы По идее они должны будут сразу остановиться т.к очередь разобрана и новых задач не от куда получить
4) Запускаем `RELEASE_VERSION=  docker-compose up -d`

# Запуск в dev режиме
Пока просто запускать консумеры не в докере

```bash
$ NODE_ENV=development node --require babel-register ./services/likesConsumer/index.js
```

##TODO: Все таки разобраться как запускать нормально в докере
На macOs запустить браузер через командную строку
```bash
$ /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9229 --user-data-dir=/Users/Just1ce/debug-chrome
```
В место `/Users/Just1ce/debug-chrome` подставить папку где будут хранится ресурсы хрома  
Если порт не стандартный - переопределить в `./config/development.json`:
```json
{
	"devModeBrowser": {
		"port": 9229,
		"host": "0.0.0.0"
	}
}
```
