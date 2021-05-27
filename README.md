# Рабочая версия медиасервера

## Стек

Приложение построено на основе библиотеки MediaSoup. 

Для запуска потребуется выполнить все пункты из этой инструкции: <https://mediasoup.org/documentation/v3/mediasoup/installation/>

## Основные API для работы:

При помощи команд ниже можно организовать подключение 2х или более пользователей.

### Создание комнаты: 
```POST /rooms```

```
Возвращает:
{
  room_id: string
}
```

### Добавление пользователя в комнату
```POST /rooms/:room_id/users/:user_id```, где *:room_id* - ИД комнаты, а *:user_id* - ИД пользователя

```
Возвращает:
{
  offer: SDP,
}
```

### Начало вещания пользователем
```POST /rooms/:room_id/users/:user_id/produce```

```
body:
{
  offer: SDP
}

Возвращает:
{
  answer: SDP,
  outbound: Array<{
    id: string,
    offer: SDP
  }>
}
```

### Подтверждение подключения пользователя
```POST /rooms/:room_id/users/:user_id/consume```

```
body: 
{
  answer: SDP
}
```

### Удаление комнаты:
```DELETE /rooms/:room_id```

*Пока не реализовано*

### Удаление пользователя из комнаты:
```DELETE /rooms/:room_id/users/:user_id```

*Пока не реализовано*