# Inventory API
Inventory System API

This is the API that connects to a sqlite database

## Persistent files

`/file` stores the database and images

## Testing with cURL

```sh
curl -F 'image=@./test.png' http://localhost:8000/image/upload
```
- Uploads an image (the '@' means that it will load a file)

```sh
curl -v -X POST http://localhost:8000/image -H 'Content-Type: application/json' -d '{"name": "hello"}'
```
- Creates a new image without a file

```sh
curl http://localhost:8000/asset
```
- Gets all assets