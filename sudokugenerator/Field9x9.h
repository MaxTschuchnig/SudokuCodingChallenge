#pragma once
#include <array>
#include <string>
#include <bitset>
#include <memory>
#include <iostream>

class Field9x9 {
	std::array < std::array<int, 9>, 9> arr{};
	std::array < std::array<int, 9>, 9> perfectSolution{};

	std::array<std::bitset<10>, 9> usedInRow{}; // save currently stored values in rows
	std::array<std::bitset<10>, 9> usedInCol{}; // save currently stored values in cols
	std::array<std::array<std::bitset<10>, 3>, 3> usedInGrid{}; // save currently stored values in grids

	const int id;	

	/// <summary>
	/// generates a random 3x3 to be used to fill the diagonals
	/// </summary>
	/// <returns>returns the 9 values to be filled from top left to bottom right as 3x3 matrix</returns>
	std::array<std::array<int, 3>, 3> generateRng3x3() const;

	/// <summary>
	/// generates a random 1x9 to be used to fill the diagonals
	/// </summary>
	/// <returns>returns the 9 values to be filled from top left to bottom right</returns>
	std::array<int, 9> generateRng9() const;

	/// <summary>
	/// fills a single 3x3 diagonal block
	/// </summary>
	/// <param name="block id">what diagonal block</param>
	/// <param name="rng values">rng values to fill the block with</param>
	void fillDiagonal3x3(size_t, const std::array<std::array<int, 3>, 3>&);

	/// <summary>
	/// check if the current number exists in the current block
	/// </summary>
	/// <param name="number">current number to check</param>
	/// <param name="block">current block to check if number is in</param>
	/// <returns></returns>
	bool notInBlock(int, const std::array<std::array<int, 3>, 3>&) const;

	/// <summary>
	/// returns the requested 3x3 block
	/// </summary>
	/// <param name="row">row in current block to return</param>
	/// <param name="col">col in current block to return</param>
	/// <returns>requested 3x3 block</returns>
	std::array<std::array<int, 3>, 3> getBlock(int row, int col) const;

	/// <summary>
	/// check if the current number exists in the current row
	/// </summary>
	/// <param name="number">current number to check</param>
	/// <param name="row">current row to check if number is in</param>
	/// <returns></returns>
	bool notInRow(int, const std::array<int, 9>&) const;

	/// <summary>
	/// returns the requested row
	/// </summary>
	/// <param name="row">n row requested</param>
	/// <returns>requested row</returns>
	std::array<int, 9> getRow(int row) const;

	/// <summary>
	/// check if the current number exists in the current column
	/// </summary>
	/// <param name="number">current number to check</param>
	/// <param name="column">current column to check if number is in</param>
	/// <returns></returns>
	bool notInCol(int, const std::array<int, 9>&) const;

	/// <summary>
	/// returns the requested col
	/// </summary>
	/// <param name="col">n col requested</param>
	/// <returns>requested col</returns>
	std::array<int, 9> getCol(int col) const;

	/// <summary>
	/// simple debug function to print the current 3x3 block
	/// </summary>
	/// <param name="toPrint">3x3 block to print</param>
	void printBlock(const std::array<std::array<int, 3>, 3>& toPrint) const;

	/// <summary>
	/// simple debug function to print the current 1x9 vector
	/// </summary>
	/// <param name="toPrint">1x9 vector to print</param>
	void print1d(const std::array<int, 9>& toPrint) const;

	/// <summary>
	/// random diagonal initialization
	/// </summary>
	void fillDiagonals();

	/// <summary>
	/// randomly applies masking. only if there is one unique path possible is the sudoku generated
	/// </summary>
	/// <param name="cues">amount of cues</param>
	/// <returns>if generation was possible, returns true</returns>
	bool tryMaskN(int cues);

	/// <summary>
	/// TODO
	/// </summary>
	/// <param name="row"></param>
	/// <param name="col"></param>
	/// <param name="nPaths"></param>
	/// <returns></returns>
	bool solveAllPaths(int row, int col, int& nPaths);

	/// <summary>
	/// TODO
	/// </summary>
	void mask();
public:
	/// <summary>
	/// prints the current sudoku state
	/// </summary>
	void Print() const;

	/// <summary>
	/// converts the sudoku into json format with the mask and template
	/// </summary>
	/// <returns>sudoku as json</returns>
	std::string ToJson() const;

	int GetNCues();

	bool getBitsetCount(const std::bitset<10>& bitset);

	void initBitsets();

	/// <summary>
	/// transpose matrix
	/// </summary>
	/// <returns>new transposed Field9x9 instance</returns>
	std::unique_ptr<Field9x9> Transpose();

	/// <summary>
	/// rotate clockwise by 90 degrees
	/// </summary>
	/// <returns>new rotated Field9x9 instance</returns>
	std::unique_ptr<Field9x9> Rotate();

	/// <summary>
	/// increment all digits {1, ..., 9} by one % 9
	/// </summary>
	/// <returns>new Field9x9 instance with incremented digits</returns>
	std::unique_ptr<Field9x9> Increment();

	std::unique_ptr<Field9x9> Leftshift();
	std::unique_ptr<Field9x9> Rightshift();
	std::unique_ptr<Field9x9> Upshift();
	std::unique_ptr<Field9x9> Downshift();

	Field9x9();
	Field9x9(const Field9x9& copy);
	Field9x9& operator=(const Field9x9& other);

	std::array < std::array<int, 9>, 9> GetState() { return this->arr; }

	static int ProgramId;

	const int GetId() const { return this->id; }
};