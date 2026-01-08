using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
[Authorize] // 1. Minden metódushoz kell login
public class NoteCardsController : ControllerBase
{
    // 🔹 Memóriában tárolt lista
    private static readonly List<NoteCardDto> _noteCards = new();

    // GET: api/notecards
    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_noteCards);
    }


// PUT: api/notecards
[HttpPut]
[Authorize(Roles = "admin")] // 2. Csak admin menthet!
public IActionResult AddOrUpdate([FromBody] NoteCardDto request)
{
    // Keressük, van-e már ilyen ID
    var existingNote = _noteCards.FirstOrDefault(n => n.Id == request.Id);

    if (existingNote != null)
    {
        // Frissítés: felülírjuk a mezőket
        existingNote.Title = request.Title;
        existingNote.Note = request.Note;

        return Ok(existingNote); // visszaküldhetjük a frissített objektumot
    }

    // Ha nincs, létrehozzuk
    _noteCards.Add(request);
    return Ok(request);
}


    // DELETE: api/notecards/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")] // 3. Csak admin törölhet!
    public IActionResult Delete(int id)
    {
        var noteCard = _noteCards.FirstOrDefault(n => n.Id == id);

        if (noteCard == null)
        {
            return NotFound("A törölni kívánt noteCard nem található.");
        }

        _noteCards.Remove(noteCard);
        return NoContent(); // 204
    }
}
