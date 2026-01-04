using System.Text.Json.Serialization;

public class NoteCardDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("title")]
    public required string Title { get; set; }

    [JsonPropertyName("note")]
    public required string Note { get; set; }
}
