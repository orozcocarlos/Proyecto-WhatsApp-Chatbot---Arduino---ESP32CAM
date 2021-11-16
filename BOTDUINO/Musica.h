#define Musica_h

class Musica {
  public:
    Musica(int pin);
    void reproducir();
    void tono();
  private:
    int tonePin = 13;
};
